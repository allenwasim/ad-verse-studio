import { getLeads, getAdmins, getTasks } from "@/lib/data";
import { LeadsPageContent } from "@/app/(dashboard)/leads/leads-page-content";

export default async function LeadsPage() {
  const leads = await getLeads();
  const admins = await getAdmins();
  const allTasks = await getTasks();

  return (
    <>
      <LeadsPageContent allLeads={leads} admins={admins} allTasks={allTasks} />
    </>
  );
}
