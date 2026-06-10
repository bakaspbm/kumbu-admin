/** O super admin inicial é criado automaticamente pelo backend (AdminBootstrapRunner). */
export type BootstrapStatus = {
  needsBootstrap: boolean;
  canBootstrap: boolean;
  schemaReady: boolean;
};

export async function getBootstrapStatus(): Promise<BootstrapStatus> {
  return {
    needsBootstrap: false,
    canBootstrap: false,
    schemaReady: true,
  };
}
