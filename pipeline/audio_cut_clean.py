import subprocess,re,json
sil=[]
o=subprocess.run(["ffmpeg","-hide_banner","-i","den.wav","-af","silencedetect=n=-34dB:d=0.12","-f","null","-"],capture_output=True,text=True).stderr
st=None
for m in re.finditer(r"silence_(start|end): ([0-9.]+)",o):
    if m.group(1)=="start": st=float(m.group(2))
    else: sil.append((st,float(m.group(2))))
START,END=6.70,73.70
CUTS=[(29.64,32.35)]  # "a una delle flotte più importanti d'Italia" (suona "fotte")
# build gaps: silences inside range + cuts treated as gaps
gaps=[s for s in sil if s[1]>START and s[0]<END]
for c in CUTS:
    gaps=[g for g in gaps if not (g[0]>=c[0]-0.01 and g[1]<=c[1]+0.01)]
    gaps.append(c)
gaps.sort()
keep=[];cur=START
for a,b in gaps:
    a=max(a,START);b=min(b,END)
    d=b-a
    if (a,b) in [(max(c[0],START),c[1]) for c in CUTS]: target=0.27
    elif d>=0.55: target=0.27
    elif d>=0.30: target=0.22
    else: continue
    # keep half target on each side
    keep.append((cur,a+target/2)); cur=b-target/2
keep.append((cur,END))
json.dump(keep,open("keep.json","w"))
tot=sum(b-a for a,b in keep);print(len(keep),"segments",round(tot,2),"s ->",round(tot/1.04,2))
parts=[];fc=""
for i,(a,b) in enumerate(keep):
    fc+=f"[0:a]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={b-a-0.018:.4f}:d=0.018[s{i}];"
fc+="".join(f"[s{i}]" for i in range(len(keep)))+f"concat=n={len(keep)}:v=0:a=1[cat];"
fc+="[cat]highpass=f=85,afftdn=nr=14:nf=-40:tn=1,equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3200:t=q:w=1.4:g=3,highshelf=f=9000:g=2,acompressor=threshold=-20dB:ratio=3.5:attack=8:release=120:makeup=3,atempo=1.04,alimiter=limit=0.89,loudnorm=I=-16:TP=-1.5:LRA=9[out]"
subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i","a48.wav","-filter_complex",fc,"-map","[out]","-ar","48000","-ac","1","voice.wav"],check=True)
