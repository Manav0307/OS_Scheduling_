document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const algorithmSelect = document.getElementById('algorithm');
    const rrSettings = document.getElementById('rr-settings');
    const addProcessBtn = document.getElementById('add-process-btn');
    const processList = document.getElementById('process-list');
    const runSimulationBtn = document.getElementById('run-simulation-btn');
    const ganttChart = document.getElementById('gantt-chart');
    const resultTbody = document.getElementById('result-tbody');
    const processRowTemplate = document.getElementById('process-row-template');

    let processCount = 0;

    // Premium Color Palette for Gantt Chart (Vibrant colors fitting dark mode)
    const PALETTE = [
        '#ef4444', // Red
        '#8b5cf6', // Violet
        '#0ea5e9', // Sky Blue
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#ec4899', // Pink
        '#3b82f6', // Blue
        '#84cc16'  // Lime
    ];

    const ALT_PALETTE = [
        '#b91c1c', 
        '#6d28d9', 
        '#0369a1', 
        '#047857', 
        '#b45309', 
        '#be185d', 
        '#1d4ed8', 
        '#4d7c0f'  
    ];

    // Listeners
    algorithmSelect.addEventListener('change', (e) => {
        if (e.target.value === 'rr') {
            rrSettings.style.display = 'block';
        } else {
            rrSettings.style.display = 'none';
        }
    });

    addProcessBtn.addEventListener('click', addProcessRow);
    runSimulationBtn.addEventListener('click', runSimulation);

    // Initialize with 3 empty processes
    addProcessRow();
    addProcessRow();
    addProcessRow();

    function addProcessRow() {
        processCount++;
        const clone = processRowTemplate.content.cloneNode(true);
        const row = clone.querySelector('.process-row');
        
        row.querySelector('.pid-display').textContent = processCount;
        row.dataset.pid = processCount;

        clone.querySelector('.remove-process-btn').addEventListener('click', (e) => {
            row.remove();
        });

        processList.appendChild(clone);
    }

    function runSimulation() {
        const rows = processList.querySelectorAll('.process-row');
        if (rows.length === 0) {
            alert("Please add at least one process.");
            return;
        }

        const processes = [];
        let valid = true;

        rows.forEach(row => {
            const pid = parseInt(row.dataset.pid);
            const arrival = parseInt(row.querySelector('.process-arrival').value);
            const burst = parseInt(row.querySelector('.process-burst').value);

            if (isNaN(arrival) || isNaN(burst) || arrival < 0 || burst <= 0) {
                valid = false;
            } else {
                processes.push({ pid, arrival, burst });
            }
        });

        if (!valid) {
            alert("Please enter valid Arrival (>=0) and Burst (>0) times for all processes.");
            return;
        }

        const algorithm = algorithmSelect.value;
        const result = algorithm === 'fcfs' ? runFCFS([...processes]) : runRR([...processes]);

        renderGanttChart(result.gantt);
        renderTable(result.processes);
    }

    // FCFS Logically Equivalent to fcfs.cpp
    function runFCFS(p) {
        p.sort((a, b) => a.arrival - b.arrival);
        let currentTime = 0;
        let gantt = [];

        p.forEach(proc => {
            if (currentTime < proc.arrival) {
                gantt.push({
                    isIdle: true,
                    start: currentTime,
                    end: proc.arrival
                });
                currentTime = proc.arrival;
            }

            gantt.push({
                isIdle: false,
                pid: proc.pid,
                start: currentTime,
                end: currentTime + proc.burst
            });

            proc.completion = currentTime + proc.burst;
            proc.turnaround = proc.completion - proc.arrival;
            proc.waiting = proc.turnaround - proc.burst;

            currentTime = proc.completion;
        });

        return { processes: p, gantt };
    }

    // RR Logically Equivalent to round_robin.cpp
    function runRR(p) {
        let tq = parseInt(document.getElementById('timeQuantum').value);
        if(isNaN(tq) || tq <= 0) tq = 1;

        p.sort((a, b) => a.arrival - b.arrival);
        p.forEach(proc => proc.remaining = proc.burst);

        const q = [];
        let currentTime = 0;
        let completed = 0;
        const n = p.length;
        let pIndex = 0;
        const gantt = [];

        while (completed < n) {
            while (pIndex < n && p[pIndex].arrival <= currentTime) {
                q.push(pIndex);
                pIndex++;
            }

            if (q.length === 0) {
                gantt.push({
                    isIdle: true,
                    start: currentTime,
                    end: currentTime + 1
                });
                currentTime++;
                continue;
            }

            const idx = q.shift();
            const execTime = Math.min(tq, p[idx].remaining);

            gantt.push({
                isIdle: false,
                pid: p[idx].pid,
                start: currentTime,
                end: currentTime + execTime
            });

            currentTime += execTime;
            p[idx].remaining -= execTime;

            while (pIndex < n && p[pIndex].arrival <= currentTime) {
                q.push(pIndex);
                pIndex++;
            }

            if (p[idx].remaining > 0) {
                q.push(idx);
            } else {
                p[idx].completion = currentTime;
                p[idx].turnaround = p[idx].completion - p[idx].arrival;
                p[idx].waiting = p[idx].turnaround - p[idx].burst;
                completed++;
            }
        }

        return { processes: p, gantt };
    }

    function renderGanttChart(gantt) {
        ganttChart.innerHTML = '';
        if (gantt.length === 0) {
            ganttChart.innerHTML = '<div class="gantt-placeholder">No data to display</div>';
            return;
        }

        // Collapse adjacent idles
        const mergedGantt = [];
        for (let entry of gantt) {
            if (mergedGantt.length > 0) {
                let last = mergedGantt[mergedGantt.length - 1];
                if (entry.isIdle && last.isIdle) {
                    last.end = entry.end;
                    continue;
                }
                if (!entry.isIdle && !last.isIdle && entry.pid === last.pid) {
                    // For logic parity, if same PID runs back to back without interrupt, we keep it separate so the color block requirement fires!
                    // Wait, if it runs consecutively, we just keep them as individual chunks to satisfy the "without consecutive colors of processes".
                }
            }
            mergedGantt.push({...entry});
        }

        let delay = 0;
        let lastPid = -1;
        let isAltColor = false;

        mergedGantt.forEach((block, index) => {
            const blockEl = document.createElement('div');
            blockEl.className = 'gantt-block';
            blockEl.style.animationDelay = `${delay}s`;
            delay += 0.05;

            const duration = block.end - block.start;
            const barWidth = Math.max(50, duration * 20); // Scale width based on time
            
            const barEl = document.createElement('div');
            barEl.className = 'gantt-bar';
            barEl.style.width = `${barWidth}px`;

            if (block.isIdle) {
                barEl.classList.add('idle');
                barEl.textContent = 'IDLE';
            } else {
                // Ensure consecutive blocks have different visual weights/colors
                if(block.pid === lastPid) {
                    isAltColor = !isAltColor;
                } else {
                    isAltColor = false;
                }
                
                const colorIdx = (block.pid - 1) % PALETTE.length;
                const bg = isAltColor ? ALT_PALETTE[colorIdx] : PALETTE[colorIdx];
                
                barEl.style.backgroundColor = bg;
                barEl.textContent = `P${block.pid}`;
                lastPid = block.pid;
            }

            const timesEl = document.createElement('div');
            timesEl.className = 'gantt-times';
            
            const timeL = document.createElement('span');
            timeL.className = 'gantt-time-left';
            timeL.textContent = block.start;

            const timeR = document.createElement('span');
            timeR.className = 'gantt-time-right';
            
            // Only show right time if it's the last block, to avoid overlapping numbers visually,
            // or we show it on all. Showing on all is standard format.
            timeR.textContent = block.end;
            
            timesEl.appendChild(timeL);
            timesEl.appendChild(timeR);

            blockEl.appendChild(barEl);
            blockEl.appendChild(timesEl);
            ganttChart.appendChild(blockEl);
        });
    }

    function renderTable(processes) {
        resultTbody.innerHTML = '';
        
        let totalTurnaround = 0;
        let totalWaiting = 0;
        
        // Output in sorted order
        const sorted = [...processes].sort((a,b) => a.pid - b.pid);

        sorted.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="status-badge" style="background: rgba(255,255,255,0.1)">P${p.pid}</span></td>
                <td>${p.arrival}</td>
                <td>${p.burst}</td>
                <td>${p.completion}</td>
                <td>${p.turnaround}</td>
                <td>${p.waiting}</td>
            `;
            resultTbody.appendChild(tr);

            totalTurnaround += p.turnaround;
            totalWaiting += p.waiting;
        });

        // Averages row
        const avgTr = document.createElement('tr');
        avgTr.style.background = 'rgba(255,255,255,0.05)';
        avgTr.style.fontWeight = '600';
        avgTr.innerHTML = `
            <td colspan="4" style="text-align: right">Average:</td>
            <td style="color: var(--accent-secondary)">${(totalTurnaround / processes.length).toFixed(2)}</td>
            <td style="color: var(--accent-secondary)">${(totalWaiting / processes.length).toFixed(2)}</td>
        `;
        resultTbody.appendChild(avgTr);
    }
});
