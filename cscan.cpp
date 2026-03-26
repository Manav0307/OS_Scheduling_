#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    int n, head, total=0;
    cin >> n;

    int req[n];
    for(int i=0;i<n;i++) cin>>req[i];

    cin >> head;

    sort(req, req+n);

    for(int i=0;i<n;i++) {
        if(req[i] >= head) {
            total += abs(head - req[i]);
            head = req[i];
        }
    }

    total += abs(head - 199); // disk end
    head = 0;

    for(int i=0;i<n;i++) {
        if(req[i] < head) {
            total += abs(head - req[i]);
            head = req[i];
        }
    }

    cout<<"Total Head Movement: "<<total;
}