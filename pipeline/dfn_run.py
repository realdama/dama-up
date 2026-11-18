import sys,types
import torchaudio
# compatibilità: torchaudio recente non ha più backend.common
if 'torchaudio.backend.common' not in sys.modules:
    m=types.ModuleType('torchaudio.backend.common')
    class AudioMetaData: pass
    m.AudioMetaData=AudioMetaData
    sys.modules['torchaudio.backend']=types.ModuleType('torchaudio.backend');sys.modules['torchaudio.backend.common']=m
import soundfile as sf,torch,numpy as np
from df.enhance import enhance, init_df
model,state,_=init_df(sys.argv[1],log_level="ERROR")
x,sr=sf.read(sys.argv[2],dtype='float32')
assert sr==state.sr(),(sr,state.sr())
for lim in [float(v) for v in sys.argv[4].split(',')]:
    y=enhance(model,state,torch.from_numpy(x)[None],atten_lim_db=lim if lim>0 else None)
    out=sys.argv[3].replace('.wav',f'_{int(lim)}.wav')
    sf.write(out,y[0].numpy(),sr);print('ok',out)
