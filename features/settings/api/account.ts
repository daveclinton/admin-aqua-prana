import { api } from "@/lib/api/client"
import type {
  ApiSuccessResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
} from "@/types/auth"

export async function deleteAccount(
  data: DeleteAccountRequest
): Promise<DeleteAccountResponse> {
  const res = await api<ApiSuccessResponse<DeleteAccountResponse>>(
    "/v1/auth/account",
    {
      method: "DELETE",
      body: data,
    }
  )
  return res.data
}
