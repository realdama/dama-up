# Vocal rider: livella frasi e parole a un target, senza alzare il rumore delle pause
import wave,numpy as np,sys
w=wave.open(sys.argv[1]);sr=w.getframerate();a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768
hop=int(0.01*sr);win=int(0.12*sr)
pad=np.pad(a**2,(win//2,win//2))
cs=np.cumsum(pad);n=len(a)//hop
rms=np.array([(cs[i*hop+win]-cs[i*hop])/win for i in range(n)])
db=10*np.log10(rms+1e-12)
speech=db>np.percentile(db,20)+8   # attività vocale relativa al rumore di fondo
target=np.median(db[speech])
g=np.where(speech,np.clip(target-db,-8,9),0.0)
# nelle pause: tieni il guadagno della parola vicina ma senza superare +2 dB (non alza il rumore)
last=0.0
for i in range(n):
    if speech[i]: last=g[i]
    else: g[i]=min(last,2.0)-5.0   # pause attenuate: niente rumore alzato
# smussatura: attacco/rilascio ~60 ms
k=np.ones(7)/7;g=np.convolve(g,k,'same');g=np.convolve(g,k,'same')
gl=np.interp(np.arange(len(a)),np.arange(n)*hop+hop//2,g)
out=a*10**(gl/20)
print('target',round(target,1),'gain min/max',round(g.min(),1),round(g.max(),1))
o=wave.open(sys.argv[2],'wb');o.setnchannels(1);o.setsampwidth(2);o.setframerate(sr)
o.writeframes((np.clip(out,-1,1)*32767).astype(np.int16).tobytes());o.close()
