### Calculator
I've created a simple calculator with basic operations such as addition, subtraction, etc. Additionally, it features an undo function, the ability to transfer values from one calculator to another, and the option to delete calculators.

### How Does It Work
To begin, you need to create a calculator using the POST method. Then, you can edit its values and send data to others using the PUT method. If you make a mistake, you can use the undo feature. Finally, you can delete the calculator to leave no trace.

### Installation
Clone The Github Respository
```bash
git clone https://github.com/Trzciano/ICP-Calculator
cd ICP-Calculator
```
First start dfx:
```bash
dfx start --host 127.0.0.1:8000 --clean
```
Then deploy canister:
```bash
dfx deploy
```
You can send request by client such as Thunder Client.