#include <iostream>
using namespace std;

int main() {
    int frames, pages;
    cin >> frames >> pages;

    int f[frames], page[pages], faults=0;

    for(int i=0;i<frames;i++) f[i]=-1;
    for(int i=0;i<pages;i++) cin>>page[i];

    int k=0;
    for(int i=0;i<pages;i++) {
        bool found=false;
        for(int j=0;j<frames;j++)
            if(f[j]==page[i]) found=true;

        if(!found) {
            f[k]=page[i];
            k=(k+1)%frames;
            faults++;
        }
    }
    cout<<"Page Faults: "<<faults;
}