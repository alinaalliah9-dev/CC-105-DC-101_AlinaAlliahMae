// DOM Elements
const planForm = document.getElementById('planForm');
const completionForm = document.getElementById('completionForm');
const completionModal = document.getElementById('completionModal');
const closeModal = document.querySelector('.close');
const plansList = document.getElementById('plansList');
const memoriesList = document.getElementById('memoriesList');
const tabBtns = document.querySelectorAll('.tab-btn');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

let isEditing = false;

// Tab Navigation
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        if (tabName === 'plans') {
            document.getElementById('plansSection').classList.add('active');
        } else {
            document.getElementById('memoriesSection').classList.add('active');
        }
    });
});

// Load Plans and Memories on Page Load
window.addEventListener('DOMContentLoaded', () => {
    loadPlans();
    loadMemories();
    checkOverduePlans();
});

// Create/Update Plan
planForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(planForm);
    const planId = document.getElementById('planId').value;
    
    const url = planId ? 'UPDATE.php' : 'CREATE.php';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            planForm.reset();
            document.getElementById('planId').value = '';
            isEditing = false;
            submitBtn.textContent = 'Add Plan';
            cancelBtn.style.display = 'none';
            loadPlans();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred');
    }
});

// Cancel Edit
cancelBtn.addEventListener('click', () => {
    planForm.reset();
    document.getElementById('planId').value = '';
    isEditing = false;
    submitBtn.textContent = 'Add Plan';
    cancelBtn.style.display = 'none';
});

// Load Plans
async function loadPlans() {
    try {
        const response = await fetch('READ.php?type=plans');
        const plans = await response.json();
        
        plansList.innerHTML = '';
        
        if (plans.length === 0) {
            plansList.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">No adventures planned yet! ¡Vámonos!</p>';
            return;
        }
        
        plans.forEach(plan => {
            const card = createPlanCard(plan);
            plansList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading plans:', error);
    }
}

// Create Plan Card
function createPlanCard(plan) {
    const card = document.createElement('div');
    card.className = 'plan-card';
    
    const targetDate = new Date(plan.target_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = targetDate < today;
    
    card.innerHTML = `
        <h3>📍 ${plan.place}</h3>
        <div class="plan-date ${isOverdue ? 'overdue' : ''}">
            📅 ${formatDate(plan.target_date)}
            ${isOverdue ? '⚠️ OVERDUE' : ''}
        </div>
        <div class="plan-description">${plan.todo_description}</div>
        <div class="card-actions">
            <button class="btn btn-done" onclick="markAsDone(${plan.id})">✓ Done</button>
            <button class="btn btn-edit" onclick="editPlan(${plan.id}, '${escapeQuotes(plan.place)}', '${plan.target_date}', '${escapeQuotes(plan.todo_description)}')">✏️ Edit</button>
            <button class="btn btn-delete" onclick="deletePlan(${plan.id})">🗑️ Delete</button>
        </div>
    `;
    
    return card;
}

// Load Memories
async function loadMemories() {
    try {
        const response = await fetch('READ.php?type=memories');
        const memories = await response.json();
        
        memoriesList.innerHTML = '';
        
        if (memories.length === 0) {
            memoriesList.innerHTML = '<p style="color: white; text-align: center; grid-column: 1/-1;">No memories yet! Complete an adventure to create one!</p>';
            return;
        }
        
        memories.forEach(memory => {
            const card = createMemoryCard(memory);
            memoriesList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading memories:', error);
    }
}

// Create Memory Card
function createMemoryCard(memory) {
    const card = document.createElement('div');
    card.className = 'memory-card';
    
    card.innerHTML = `
        <h3>📍 ${memory.place}</h3>
        <div class="memory-date">📅 Completed: ${formatDate(memory.completed_at)}</div>
        <div class="memory-description">${memory.todo_description}</div>
        ${memory.completion_text ? `<div class="memory-text">"${memory.completion_text}"</div>` : ''}
        ${memory.image_path ? `<img src="${memory.image_path}" alt="Memory" class="memory-image">` : ''}
        <div class="card-actions">
            <button class="btn btn-delete" onclick="deleteMemory(${memory.id}, '${memory.image_path || ''}')">🗑️ Delete Memory</button>
        </div>
    `;
    
    return card;
}

// Mark Plan as Done
function markAsDone(planId) {
    document.getElementById('completePlanId').value = planId;
    completionModal.style.display = 'block';
}

// Make functions available globally
window.markAsDone = markAsDone;

// Complete Plan and Save to Memories
completionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(completionForm);
    
    try {
        const response = await fetch('CREATE.php?action=complete', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            completionForm.reset();
            completionModal.style.display = 'none';
            loadPlans();
            loadMemories();
            
            // Switch to memories tab
            tabBtns.forEach(btn => {
                if (btn.dataset.tab === 'memories') {
                    btn.click();
                }
            });
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred');
    }
});

// Edit Plan
function editPlan(id, place, targetDate, description) {
    document.getElementById('planId').value = id;
    document.getElementById('place').value = place;
    document.getElementById('targetDate').value = targetDate;
    document.getElementById('todoDescription').value = description;
    
    isEditing = true;
    submitBtn.textContent = 'Update Plan';
    cancelBtn.style.display = 'inline-block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Make editPlan available globally
window.editPlan = editPlan;

// Delete Plan
async function deletePlan(id) {
    if (!confirm('Are you sure you want to delete this adventure?')) {
        return;
    }
    
    try {
        const response = await fetch('DELETE.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `planId=${id}`
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadPlans();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred');
    }
}

// Make deletePlan available globally
window.deletePlan = deletePlan;

// Check and Delete Overdue Plans
async function checkOverduePlans() {
    try {
        const response = await fetch('DELETE.php?action=check_overdue', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.deleted > 0) {
            console.log(`Deleted ${result.deleted} overdue plan(s)`);
            loadPlans();
        }
    } catch (error) {
        console.error('Error checking overdue plans:', error);
    }
}

// Close Modal
closeModal.addEventListener('click', () => {
    completionModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === completionModal) {
        completionModal.style.display = 'none';
    }
});

// Helper Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function escapeQuotes(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// Delete Memory
async function deleteMemory(memoryId, imagePath) {
    if (!confirm('Are you sure you want to delete this memory? This cannot be undone!')) {
        return;
    }
    
    try {
        const response = await fetch('DELETE.php?action=delete_memory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `memoryId=${memoryId}&imagePath=${encodeURIComponent(imagePath)}`
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadMemories();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred');
    }
}

// Make deleteMemory available globally
window.deleteMemory = deleteMemory;

// Check for overdue plans every 5 minutes
setInterval(checkOverduePlans, 300000);