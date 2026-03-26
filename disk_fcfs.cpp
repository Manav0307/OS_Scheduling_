#include <iostream>
using namespace std;

int main() {
    int n, head, total=0;
    cin >> n;

    int req[n];
    for(int i=0;i<n;i++) cin>>req[i];

    cin >> head;

    for(int i=0;i<n;i++) {
        total += abs(head - req[i]);
        head = req[i];
    }

    cout<<"Total Head Movement: "<<total;
}