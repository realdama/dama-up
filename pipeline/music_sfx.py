import numpy as np, wave, json
SR=48000; T=80.25; N=int(SR*T); t=np.arange(N)/SR
BPM=90; beat=60/BPM
rng=np.random.default_rng(7)
def note(m): return 440*2**((m-69)/12)
def lp(x,a):  # one-pole lowpass
    y=np.empty_like(x); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
L=np.zeros(N); R=np.zeros(N)
chords=[[57,60,64,69],[53,57,60,65],[48,55,60,64],[55,59,62,67]]  # Am F C G
bars=2; clen=bars*4*beat
# pads
for ci in range(int(T/clen)+1):
    ch=chords[ci%4]; s0=ci*clen; i0=int(s0*SR); i1=min(N,int((s0+clen+1.2)*SR))
    if i0>=N: break
    tt=np.arange(i1-i0)/SR; d=clen+1.2
    env=np.minimum(1,tt/1.2)*np.minimum(1,np.maximum(0,(d-tt)/1.2))
    for k,m in enumerate(ch):
        f=note(m)
        for det,pan in ((-0.12,0.3),(0.12,0.7)):
            ff=f*2**(det/12/8)
            w=np.sin(2*np.pi*ff*tt)+0.35*np.sin(2*np.pi*2*ff*tt)+0.12*np.sin(2*np.pi*3*ff*tt)
            L[i0:i1]+=0.035*w*env*(1-pan); R[i0:i1]+=0.035*w*env*pan
    # bass
    f=note(ch[0]-12); tt2=tt; w=np.sin(2*np.pi*f*tt2)*env
    L[i0:i1]+=0.07*w; R[i0:i1]+=0.07*w
# arpeggio plucks (eighths)
step=beat/2; k=0; s=0.0
while s<T-0.5:
    ci=int(s/clen)%4; ch=chords[ci]; m=ch[[0,2,1,3,2,1,3,2][k%8]]+12
    i0=int(s*SR); n=int(1.2*SR); i1=min(N,i0+n); tt=np.arange(i1-i0)/SR
    w=(np.sin(2*np.pi*note(m)*tt)+0.2*np.sin(2*np.pi*2*note(m)*tt))*np.exp(-tt*5)*np.minimum(1,tt/0.004)
    pan=0.35 if k%2 else 0.65; g=0.03
    L[i0:i1]+=g*w*(1-pan); R[i0:i1]+=g*w*pan
    s+=step; k+=1
# soft kick on 1 & 3, hat on offbeats (start after 2 s)
s=0.0;b=0
while s<T:
    i0=int(s*SR); n=int(0.4*SR); i1=min(N,i0+n); tt=np.arange(i1-i0)/SR
    if b%2==0 and s>1.9:
        fr=50+90*np.exp(-tt*30); ph=2*np.pi*np.cumsum(fr)/SR
        w=np.sin(ph)*np.exp(-tt*9); L[i0:i1]+=0.16*w; R[i0:i1]+=0.16*w
    j0=int((s+beat/2)*SR); j1=min(N,j0+int(0.06*SR))
    if j0<N and s>1.9:
        nz=rng.standard_normal(j1-j0); nz=nz-lp(nz,0.5); e=np.exp(-np.arange(j1-j0)/SR*60)
        pass
    s+=beat;b+=1
mus=np.stack([L,R],1)
# fade in/out, lift on logo
LOGO=76.37
g=np.minimum(1,t/0.8)*np.where(t>LOGO,1.6,1.0)*np.minimum(1,np.maximum(0,(T-t)/1.5))
mus*=g[:,None]
mus/=np.abs(mus).max()/0.5
def wr(name,x):
    x=np.clip(x,-1,1); w=wave.open(name,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype(np.int16).tobytes()); w.close()
wr('music.wav',mus)
# SFX
sfx=np.zeros((N,2))
def whoosh(at,g=0.10,d=0.5):
    i0=int((at-0.18)*SR); n=int(d*SR); i0=max(0,i0); i1=min(N,i0+n); m=i1-i0
    nz=rng.standard_normal(m); x=np.linspace(0,1,m)
    a=0.01+0.10*np.sin(np.pi*x)**2
    y=np.empty(m); s1=0.0
    for i in range(m): s1+=a[i]*(nz[i]-s1); y[i]=s1
    env=np.sin(np.pi*x)**2
    pan=x
    sfx[i0:i1,0]+=g*y*env*(1-0.6*pan); sfx[i0:i1,1]+=g*y*env*(0.4+0.6*pan)
for at in json.load(open('sfx_times.json')): whoosh(at)
# boom + shimmer at logo
i0=int((LOGO-0.02)*SR); n=int(2.5*SR); tt=np.arange(n)/SR
fr=38+70*np.exp(-tt*12); boom=np.sin(2*np.pi*np.cumsum(fr)/SR)*np.exp(-tt*2.8)*0.9
nz=rng.standard_normal(n); boom+=lp(nz,0.03)*np.exp(-tt*8)*0.6
sh=sum(np.sin(2*np.pi*f*tt+p)*np.exp(-tt*1.4) for f,p in ((2093,0),(2637,1),(3136,2),(4186,3)))*0.05*np.minimum(1,tt/0.15)*(1+0.3*np.sin(2*np.pi*7*tt))
i1=min(N,i0+n); sfx[i0:i1,0]+=(boom+sh*0.8)[:i1-i0]; sfx[i0:i1,1]+=(boom+sh*1.2)[:i1-i0]
wr('sfx.wav',sfx*0.9)
print('ok')
