import subprocess,re,json,sys
# Taglio voce: pause compresse + tagli di frasi. CUTS = (tieni fino a, riprendi da), entrambi dentro silenzi.
SRC="a48.wav"; DEN="den.wav"
START,END=1.70,101.40
CUTS=[(18.58,19.86),(51.42,54.27)]  # "oltre al terreno(Tirreno)", "e poi le quote UE": poco chiari
CUT_PAUSE=0.08
o=subprocess.run(["ffmpeg","-hide_banner","-i",DEN,"-af","silencedetect=n=-34dB:d=0.12","-f","null","-"],capture_output=True,text=True).stderr
sil=[];st=None
for m in re.finditer(r"silence_(start|end): ([0-9.]+)",o):
    if m.group(1)=="start": st=float(m.group(2))
    else: sil.append((st,float(m.group(2))))
ev=[]
for a,b in sil:
    a=max(a,START);b=min(b,END)
    if b<=a or any(not(b<=c0-0.3 or a>=c1+0.3) for c0,c1 in CUTS): continue
    d=b-a
    if d<0.30: continue
    t=0.27 if d>=0.55 else 0.22
    ev.append((a+t/2,b-t/2,None))
for c0,c1 in CUTS: ev.append((c0,c1,CUT_PAUSE))
ev.sort()
pieces=[];cur=START
for a,b,pause in ev:
    pieces.append(("a",cur,a))
    if pause: pieces.append(("s",pause,None))
    cur=b
pieces.append(("a",cur,END))
assert all(p[0]=="s" or p[2]>p[1] for p in pieces)
fc="";n=0
for p in pieces:
    if p[0]=="a":
        a,b=p[1],p[2]
        fc+=f"[0:a]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={max(0,b-a-0.018):.4f}:d=0.018[s{n}];"
    else:
        fc+=f"aevalsrc=0:d={p[1]}:s=48000[s{n}];"
    n+=1
fc+="".join(f"[s{i}]" for i in range(n))+f"concat=n={n}:v=0:a=1[cat];"
fc+="[cat]highpass=f=85,afftdn=nr=14:nf=-40:tn=1,equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3200:t=q:w=1.4:g=3,highshelf=f=9000:g=2,acompressor=threshold=-20dB:ratio=3.5:attack=8:release=120:makeup=3,atempo=1.04,alimiter=limit=0.89,loudnorm=I=-16:TP=-1.5:LRA=9[out]"
subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",SRC,"-filter_complex",fc,"-map","[out]","-ar","48000","-ac","1","voice.wav"],check=True)
tot=sum((p[2]-p[1]) if p[0]=="a" else p[1] for p in pieces)
print(len(pieces),"pezzi",round(tot,2),"s ->",round(tot/1.04,2))
