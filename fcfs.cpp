#include <bits/stdc++.h>
using namespace std;

struct Process {
    int pid;
    int arrival;
    int burst;
    int completion;
    int waiting;
    int turnaround;
};

int main() {
    int n;
    cout << "Enter number of processes: ";
    cin >> n;

    vector<Process> p(n);

    // Input
    for(int i = 0; i < n; i++) {
        p[i].pid = i + 1;
        cout << "Enter Arrival Time and Burst Time for Process " << p[i].pid << ": ";
        cin >> p[i].arrival >> p[i].burst;
    }

    // Sort by arrival time (FCFS)
    sort(p.begin(), p.end(), [](Process a, Process b) {
        return a.arrival < b.arrival;
    });

    int currentTime = 0;

    cout << "\nGantt Chart:\n";

    for(int i = 0; i < n; i++) {
        if(currentTime < p[i].arrival) {
            // CPU idle case
            cout << "| Idle (" << currentTime << "-" << p[i].arrival << ") ";
            currentTime = p[i].arrival;
        }

        cout << "| P" << p[i].pid << " (" << currentTime << "-"
             << currentTime + p[i].burst << ") ";

        p[i].completion = currentTime + p[i].burst;
        p[i].turnaround = p[i].completion - p[i].arrival;
        p[i].waiting = p[i].turnaround - p[i].burst;

        currentTime = p[i].completion;
    }

    cout << "|\n";

    // Table Output
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
