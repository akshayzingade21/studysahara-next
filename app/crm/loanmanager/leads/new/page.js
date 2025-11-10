// app/crm/loanmanager/leads/new/page.js
import LeadForm from '../../../../../components/crm/LeadForm';
export default function NewLead(){
  return (
    <div className="bg-white border rounded p-4">
      <div className="font-medium mb-3">Create Lead</div>
      <LeadForm/>
    </div>
  );
}