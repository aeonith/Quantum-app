import { api, setAuthToken } from './client';
import { getOrCreateWallet, signMessage } from '../crypto/wallet';

export async function login(): Promise<{ jwt: string; address: string }> {
  const wallet = await getOrCreateWallet();
  const address = wallet.publicKey;

  const { data: nonceResp } = await api.get<{ nonce: string }>('/auth/nonce', { params: { address } });
  const signature = signMessage(wallet.secretKey, nonceResp.nonce);

  const { data } = await api.post<{ jwt: string }>('/auth/verify', {
    address, signature, nonce: nonceResp.nonce
  });

  setAuthToken(data.jwt);
  return { jwt: data.jwt, address };
}
