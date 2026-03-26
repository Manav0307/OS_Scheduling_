#include <iostream>
using namespace std;

int main() {
    int n, f;
    cin>>n>>f;

    int pages[n], frame[f], time[f], faults=0;

    for(int i=0;i<n;i++) cin>>pages[i];
    for(int i=0;i<f;i++) frame[i]=-1;

    for(int i=0;i<n;i++) {
        int pos=-1;

        for(int j=0;j<f;j++)
            if(frame[j]==pages[i]) pos=j;

        if(pos==-1) {
            int lru=0;
            for(int j=1;j<f;j++)
                if(time[j]<time[lru]) lru=j;

            frame[lru]=pages[i];
            time[lru]=i;
            faults++;
        } else time[pos]=i;
    }
    cout<<"Page Faults: "<<faults;
}