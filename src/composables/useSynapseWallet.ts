/**
 * Synapse 钱包信息：GET /synapse/wallet-info（仅管理员可调）
 * 用于首页展示 FIL/USDFC 余额与 Payments 可用余额
 */
import { ref, onMounted } from 'vue';
import { api } from 'src/boot/axios';
import { SYNAPSE_WALLET_INFO_PATH, SYNAPSE_APPROVE_PATH, SYNAPSE_APPROVE_TIMEOUT_MS } from 'src/constants/api';
import type { SynapseWalletInfo } from 'src/types/api';
import type { BackendSuccessResponse } from 'src/types/api';

const DECIMALS = 18n;
const DECIMALS_TEN = 10n ** DECIMALS;

/** 将 wei 字符串格式化为可读数量（最多 4 位小数，末尾 0 省略） */
export function formatWei(wei: string): string {
  if (!wei || wei === '0') return '0';
  try {
    const b = BigInt(wei);
    if (b === 0n) return '0';
    const whole = b / DECIMALS_TEN;
    const frac = (b % DECIMALS_TEN).toString().padStart(Number(DECIMALS), '0').slice(0, 4).replace(/0+$/, '');
    return frac ? `${whole}.${frac}` : whole.toString();
  } catch {
    return '0';
  }
}

export function useSynapseWallet() {
  const wallet = ref<SynapseWalletInfo | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  async function fetchWallet() {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.get<BackendSuccessResponse<SynapseWalletInfo>>(SYNAPSE_WALLET_INFO_PATH);
      const body = res.data;
      if (body.success && body.data != null) {
        wallet.value = body.data;
      } else {
        wallet.value = null;
      }
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      wallet.value = null;
    } finally {
      loading.value = false;
    }
  }

  /** 存款 USDFC 并批准 operator，可选金额（如 "2.5"），不传则用服务端默认 */
  async function approveDeposit(depositAmount?: string): Promise<void> {
    const body = depositAmount != null && depositAmount.trim() !== '' ? { deposit_amount: depositAmount.trim() } : {};
    await api.post(SYNAPSE_APPROVE_PATH, body, { timeout: SYNAPSE_APPROVE_TIMEOUT_MS });
    await fetchWallet();
  }

  onMounted(() => {
    void fetchWallet();
  });

  return { wallet, loading, error, refetch: fetchWallet, approveDeposit, formatWei };
}
