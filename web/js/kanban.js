let kSt={draggedId:null};
function initKanbanUI(){renderKanban();}
function addKanbanTask(){
  const inp=document.getElementById('kb-new-task');const title=inp?.value?.trim();
  if(!title){showToast('⚠️ أدخل اسم المهمة','red');return;}
  const tasks=DB.get('kanban_tasks')||[];
  tasks.push({id:Date.now(),title,status:'todo'});
  DB.set('kanban_tasks',tasks);
  queueCloudBackup();
  inp.value='';addXP(5,'مهمة جديدة');renderKanban();
  queueCloudBackup();
}
function renderKanban(){
  const tasks=DB.get('kanban_tasks')||[];
  ['todo','in_progress','done'].forEach(status=>{
    const col=document.getElementById(`kb-col-${status}`);if(!col)return;
    const colTasks=tasks.filter(t=>t.status===status);
    col.innerHTML=colTasks.map(t=>`
      <div class="kb-task" draggable="true" ondragstart="kbDragStart(event,${t.id})" ondragend="kbDragEnd(event)">
        <div class="kb-task-title" style="${status==='done'?'text-decoration:line-through;color:var(--text3)':''}">${t.title}</div>
        <div class="kb-task-actions">
          ${status!=='done'?`<button onclick="kbMove(${t.id},'done')" title="إكمال">✅</button>`:''}
          <button onclick="kbDelete(${t.id})" style="color:var(--red)" title="حذف">🗑</button>
        </div>
      </div>
    `).join('');
  });
}
function kbDragStart(e,id){kSt.draggedId=id;e.target.classList.add('dragging');e.dataTransfer.setData('text/plain',id);}
function kbDragEnd(e){e.target.classList.remove('dragging');kSt.draggedId=null;}
function kbAllowDrop(e){e.preventDefault();}
function kbDrop(e,status){
  e.preventDefault();if(!kSt.draggedId)return;
  kbMove(kSt.draggedId,status);
}
function kbMove(id,newStatus){
  const tasks=DB.get('kanban_tasks')||[];
  const idx=tasks.findIndex(t=>t.id===id);if(idx===-1)return;
  const oldStatus=tasks[idx].status;if(oldStatus===newStatus)return;
  tasks[idx].status=newStatus;DB.set('kanban_tasks',tasks);
  if(newStatus==='done'){showToast('✅ مهمة مكتملة!','green');addXP(10,'إنجاز مهمة');tryUnlock('first_task');if(tasks.filter(t=>t.status==='done').length>=10)tryUnlock('ten_tasks');fireConfetti();}
  renderKanban();queueCloudBackup();
}
function kbDelete(id){
  let tasks=DB.get('kanban_tasks')||[];tasks=tasks.filter(t=>t.id!==id);
  DB.set('kanban_tasks',tasks);showToast('🗑️ تم الحذف');renderKanban();queueCloudBackup();
}
window.initKanbanUI=initKanbanUI;window.addKanbanTask=addKanbanTask;window.kbDragStart=kbDragStart;window.kbDragEnd=kbDragEnd;window.kbAllowDrop=kbAllowDrop;window.kbDrop=kbDrop;window.kbMove=kbMove;window.kbDelete=kbDelete;
