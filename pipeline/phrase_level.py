# Livellamento per FRASE: guadagno costante dentro ogni frase, rampe morbide nelle pause.
import json,wave,numpy as np,sys
src,trj,out=sys.argv[1:4]
w=wave.open(src);sr=w.getframerate();a=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float)/32768
segs=json.load(open(trj))
def lev(x):
    n=int(0.05*sr);r=np.array([np.sqrt(np.mean(x[i:i+n]**2)) for i in range(0,max(1,len(x)-n),n)])
    act=r[r>np.percentile(r,30)]
    return 20*np.log10(np.mean(act)+1e-9)
L=[lev(a[int(s['start']*sr):int(s['end']*sr)]) for s in segs]
tgt=np.median(L)
G=[float(np.clip(tgt-l,-6,6)) for l in L]
gain=np.zeros(len(a))
bounds=[0]+[int(((segs[i]['end']+segs[i+1]['start'])/2)*sr) for i in range(len(segs)-1)]+[len(a)]
for i,g in enumerate(G): gain[bounds[i]:bounds[i+1]]=g
k=int(0.08*sr);gain=np.convolve(gain,np.ones(k)/k,'same')
y=a*10**(gain/20)
print('livelli frasi',np.round(L,1).tolist());print('guadagni',np.round(G,1).tolist())
o=wave.open(out,'wb');o.setnchannels(1);o.setsampwidth(2);o.setframerate(sr);o.writeframes((np.clip(y,-1,1)*32767).astype(np.int16).tobytes());o.close()
