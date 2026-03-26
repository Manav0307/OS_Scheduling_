#include <bits/stdc++.h>
using namespace std;

struct Process {
    int pid;
    int arrival;
    int burst;
    int remaining;
    int completion;
    int waiting;
    int turnaround;
};

int main() {
    int n, tq;
    cout << "Enter number of processes: ";
    cin >> n;

    vector<Process> p(n);

    // Input
    for(int i = 0; i < n; i++) {
        p[i].pid = i + 1;
        cout << "Enter Arrival Time and Burst Time for Process " << p[i].pid << ": ";
        cin >> p[i].arrival >> p[i].burst;
        p[i].remaining = p[i].burst;
    }

    cout << "Enter Time Quantum: ";
    cin >> tq;

    // Sort by arrival time
    sort(p.begin(), p.end(), [](Process a, Process b) {
        return a.arrival < b.arrival;
    });

    queue<int> q;
    int currentTime = 0, completed = 0, i = 0;

    cout << "\nGantt Chart:\n";

    while(completed < n) {

        // Push all processes that have arrived
        while(i < n && p[i].arrival <= currentTime) {
            q.push(i);
            i++;
        }

        if(q.empty()) {
            // CPU idle
            cout << "| Idle (" << currentTime << "-" << currentTime + 1 << ") ";
            currentTime++;
            continue;
        }

        int idx = q.front();
        q.pop();

        int execTime = min(tq, p[idx].remaining);

        cout << "| P" << p[idx].pid << " (" << currentTime
             << "-" << currentTime + execTime << ") ";

        currentTime += execTime;
        p[idx].remaining -= execTime;

        // Add newly arrived processes during execution
        while(i < n && p[i].arrival <= currentTime) {
            q.push(i);
            i++;
        }

        if(p[idx].remaining > 0) {
            q.push(idx); // not finished, push back
        } else {
            p[idx].completion = currentTime;
            p[idx].turnaround = p[idx].completion - p[idx].arrival;
            p[idx].waiting = p[idx].turnaround - p[idx].burst;
            completed++;
        }
    }

    cout << "|\n";

    // Output Table
    cout << "\nPID\tAT\tBT\tCT\tTAT\tWT\n";
    for(auto &proc : p) {
        cout << proc.pid << "\t"
             << proc.arrival << "\t"
             << proc.burst << "\t"
             << proc.completion << "\t"
             << proc.turnaround << "\t"
             << proc.waiting << "\n";
    }

    return 0;
}
