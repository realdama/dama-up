import sys,numpy as np,librosa
from speechmos import dnsmos
for p in sys.argv[1:]:
    y,sr=librosa.load(p,sr=16000,mono=True)
    y=y*(10**(-26/20)/(np.sqrt(np.mean(y**2))+1e-9))  # stesso livello RMS per tutti
    seg=10*16000;res=[]
    for i in range(0,len(y)-seg,seg):
        r=dnsmos.run(y[i:i+seg],16000);res.append((r['sig_mos'],r['bak_mos'],r['ovrl_mos']))
    a=np.array(res).mean(0)
    print(f"{p:28s} SIG {a[0]:.2f}  BAK {a[1]:.2f}  OVRL {a[2]:.2f}")
