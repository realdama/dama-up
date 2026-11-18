# Accorcia le pause DENTRO le frasi; salva gli intervalli tolti (tempo vecchio) per riallineare il video
import json,re,subprocess,numpy as np,soundfile as sf
SRC='voice_final.wav'
o=subprocess.run(['ffmpeg','-hide_banner','-i',SRC,'-af','silencedetect=n=-38dB:d=0.09','-f','null','-'],capture_output=True,text=True).stderr
sil=[];st=None
for m in re.finditer(r"silence_(start|end): ([0-9.]+)",o):
    if m.group(1)=='start': st=float(m.group(2))
    else: sil.append((st,float(m.group(2))))
W=[w for s in json.load(open('trv.json')) for w in s['words']]
cuts=[]
for a,b in sil:
    if a<0.3 or b>76.2: continue   # non toccare inizio e chiusura (logo)
    prev=[w for w in W if w['s']<a-0.05]
    t=prev[-1]['w'].strip() if prev else ''
    tgt=0.22 if re.search(r'[.?!]$',t) else (0.14 if t.endswith(',') else 0.07)
    if b-a>tgt+0.03:
        cuts.append((round(a+tgt/2,4),round(b-tgt/2,4),t,round(b-a,2),tgt))
y,sr=sf.read(SRC)
keep=[];cur=0.0
for a,b,*_ in cuts: keep.append((cur,a));cur=b
keep.append((cur,len(y)/sr))
f=int(0.008*sr);out=[]
for a,b in keep:
    x=y[int(a*sr):int(b*sr)].copy()
    if len(x)>2*f:
        x[:f]*=np.linspace(0,1,f);x[-f:]*=np.linspace(1,0,f)
    out.append(x)
z=np.concatenate(out);sf.write('voice_tight.wav',z.astype(np.float32),sr,subtype='PCM_16')
json.dump([[a,b] for a,b,*_ in cuts],open('tight_cuts.json','w'))
tot=sum(b-a for a,b,*_ in cuts)
print(len(cuts),'pause accorciate, tolti',round(tot,2),'s ->',round(len(z)/sr,2),'s')
for c in cuts:
    if 38<c[0]<50: print(c)
