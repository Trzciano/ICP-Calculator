// cannister code goes here
import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle';
import express from 'express';

class Calculator {
    id: string;
    number: number;
    numberBefore: number;
    createdAt: Date;
    updatedAt: Date | null;
}

const calculatorStorage = StableBTreeMap<string, Calculator>(0);

export default Server(() => {
    const app = express();
    app.use(express.json());

    //Saving history for calculator operations
    app.use("/calculator/:id", (req, res, next) => {
        const calculatorId = req.params.id;
        const excludedEndpoints = ['/send/', '/undo']; //Endpoints to exclude
        const shouldExclude = excludedEndpoints.some(endpoint => req.originalUrl.includes(endpoint));
        if (!shouldExclude) {
            const calculatorOpt = calculatorStorage.get(calculatorId);
            if ("None" in calculatorOpt) {
                res.status(404).send(`Calculator with id=${calculatorId} not found`);
            } else {
                const calculator = calculatorOpt.Some;
                calculator.numberBefore = calculator.number;
                calculatorStorage.insert(calculatorId, calculator);
                next();
            }
        } else {
            next(); //Skip
        }
    });

    //Creating calculator
    app.post("/calculator", (req, res) => {
        const calculator: Calculator =  {id: uuidv4(), number:0,createdAt: getCurrentDate(), ...req.body};
        calculatorStorage.insert(calculator.id, calculator);
        res.json(calculator);
    });

    //List of all calculators
    app.get("/calculator", (req, res) => {
        res.json(calculatorStorage.values());
     });

    //About 1 calculator
    app.get("/calculator/:id", (req, res) => {
        const calculatorId = req.params.id;
        const calculatorOpt = calculatorStorage.get(calculatorId);
        if ("None" in calculatorOpt) {
            res.status(404).send(`Calculator with id=${calculatorId} not found`);
        } else {
            const calculator = calculatorOpt.Some;
            res.json(calculator);
        }
    });

    //Undo calculator operation
    app.put("/calculator/:id/undo", (req, res) => {
        const calculatorId = req.params.id;
        const calculatorOpt = calculatorStorage.get(calculatorId);
        if ("None" in calculatorOpt) {
            res.status(404).send(`Calculator with id=${calculatorId} not found`);
        } else {
            const calculator = calculatorOpt.Some;
            calculator.number = calculator.numberBefore; // Przywrócenie wartości number do numberBefore
            calculator.updatedAt = getCurrentDate();
            calculatorStorage.insert(calculatorId, calculator);
            res.json(calculator);
        }
    });

    //Set calculator value
    app.put("/calculator/:id/set", (req, res) => {
        const calculatorId = req.params.id;
        const valueToSet = req.body.value;
        const calculatorOpt = calculatorStorage.get(calculatorId);
        if ("None" in calculatorOpt) {
            res.status(404).send(`Calculator with id=${calculatorId} not found`);
        } else {
            const calculator = calculatorOpt.Some;
            calculator.number = valueToSet;
            calculator.updatedAt = getCurrentDate();
            calculatorStorage.insert(calculatorId, calculator);
            res.json(calculator);
        }
    });

    //Add
    app.put("/calculator/:id/add", (req, res) => {
        const calculatorId = req.params.id;
        const valueToAdd = req.body.value;
        const calculatorOpt = calculatorStorage.get(calculatorId);
        if ("None" in calculatorOpt) {
            res.status(404).send(`Calculator with id=${calculatorId} not found`);
        } else {
            const calculator = calculatorOpt.Some;
            calculator.number += valueToAdd;
            calculator.updatedAt = getCurrentDate();
            calculatorStorage.insert(calculatorId, calculator);
            res.json(calculator);
        }
    });

    //Subtract
    app.put("/calculator/:id/sub", (req, res) => {
        const calculatorId = req.params.id;
        const valueToAdd = req.body.value;
        const calculatorOpt = calculatorStorage.get(calculatorId);
        if ("None" in calculatorOpt) {
            res.status(404).send(`Calculator with id=${calculatorId} not found`);
        } else {
            const calculator = calculatorOpt.Some;
            calculator.number -= valueToAdd;
            calculator.updatedAt = getCurrentDate();
            calculatorStorage.insert(calculatorId, calculator);
            res.json(calculator);
        }
    });

    //Multiply
    app.put("/calculator/:id/multiply", (req, res) => {
        const calculatorId = req.params.id;
        const valueToAdd = req.body.value;
        const calculatorOpt = calculatorStorage.get(calculatorId);
        if ("None" in calculatorOpt) {
            res.status(404).send(`Calculator with id=${calculatorId} not found`);
        } else {
            const calculator = calculatorOpt.Some;
            calculator.number *= valueToAdd;
            calculator.updatedAt = getCurrentDate();
            calculatorStorage.insert(calculatorId, calculator);
            res.json(calculator);
        }
    });

    //Divide
    app.put("/calculator/:id/divide", (req, res) => {
        const calculatorId = req.params.id;
        const valueToAdd = req.body.value;
        const calculatorOpt = calculatorStorage.get(calculatorId);
        if ("None" in calculatorOpt) {
            res.status(404).send(`Calculator with id=${calculatorId} not found`);
        } else {
            const calculator = calculatorOpt.Some;
            calculator.number /= valueToAdd;
            calculator.updatedAt = getCurrentDate();
            calculatorStorage.insert(calculatorId, calculator);
            res.json(calculator);
        }
    });

    //Square (^2)
    app.put("/calculator/:id/square", (req, res) => {
        const calculatorId = req.params.id;
        const calculatorOpt = calculatorStorage.get(calculatorId);
        if ("None" in calculatorOpt) {
            res.status(404).send(`Calculator with id=${calculatorId} not found`);
        } else {
            const calculator = calculatorOpt.Some;
            calculator.number = Math.pow(calculator.number, 2);
            calculator.updatedAt = getCurrentDate();
            calculatorStorage.insert(calculatorId, calculator);
            res.json(calculator);
        }
    });

    //Square root
    app.put("/calculator/:id/squareroot", (req, res) => {
        const calculatorId = req.params.id;
        const calculatorOpt = calculatorStorage.get(calculatorId);
        if ("None" in calculatorOpt) {
            res.status(404).send(`Calculator with id=${calculatorId} not found`);
        } else {
            const calculator = calculatorOpt.Some;
            calculator.number = Math.sqrt(calculator.number);
            calculator.updatedAt = getCurrentDate();
            calculatorStorage.insert(calculatorId, calculator);
            res.json(calculator);
        }
    });

    //Increment (++)
    app.put("/calculator/:id/increment", (req, res) => {
        const calculatorId = req.params.id;
        const calculatorOpt = calculatorStorage.get(calculatorId);
        if ("None" in calculatorOpt) {
            res.status(404).send(`Calculator with id=${calculatorId} not found`);
        } else {
            const calculator = calculatorOpt.Some;
            calculator.number += 1;
            calculator.updatedAt = getCurrentDate();
            calculatorStorage.insert(calculatorId, calculator);
            res.json(calculator);
        }
    });

    //Decrement (--)
    app.put("/calculator/:id/decrement", (req, res) => {
        const calculatorId = req.params.id;
        const calculatorOpt = calculatorStorage.get(calculatorId);
        if ("None" in calculatorOpt) {
            res.status(404).send(`Calculator with id=${calculatorId} not found`);
        } else {
            const calculator = calculatorOpt.Some;
            calculator.number -= 1;
            calculator.updatedAt = getCurrentDate();
            calculatorStorage.insert(calculatorId, calculator);
            res.json(calculator);
        }
    });

    //Send number from source to target
    app.put("/calculator/:sourceId/send/:targetId", (req, res) => {
        const sourceCalculatorId = req.params.sourceId;
        const targetCalculatorId = req.params.targetId;
    
        const sourceCalculatorOpt = calculatorStorage.get(sourceCalculatorId);
        if ("None" in sourceCalculatorOpt) {
            return res.status(404).send(`Source Calculator with id=${sourceCalculatorId} not found`);
        }
        const sourceCalculator = sourceCalculatorOpt.Some;
    
        const targetCalculatorOpt = calculatorStorage.get(targetCalculatorId);
        if ("None" in targetCalculatorOpt) {
            return res.status(404).send(`Target Calculator with id=${targetCalculatorId} not found`);
        }
        const targetCalculator = targetCalculatorOpt.Some;
    
        targetCalculator.numberBefore = targetCalculator.number;
        targetCalculator.number = sourceCalculator.number;
    
        const currentDate = getCurrentDate();
        sourceCalculator.updatedAt = currentDate;
        targetCalculator.updatedAt = currentDate;
    
        calculatorStorage.insert(sourceCalculatorId, sourceCalculator);
        calculatorStorage.insert(targetCalculatorId, targetCalculator);
    
        res.json(targetCalculator);
    });

    //Delete all calculators
    app.delete("/calculators/deleteall", (req, res) => {
        const calculatorIds = Array.from(calculatorStorage.keys());
    
        calculatorIds.forEach(calculatorId => {
            calculatorStorage.remove(calculatorId);
        });
    
        res.send("All calculators deleted successfully");
    });

    //Delete 1 calculator
    app.delete("/calculator/:id", (req, res) => {
        const calculatorId = req.params.id;
        const deletedCalculator = calculatorStorage.remove(calculatorId);
        if ("None" in deletedCalculator) {
           res.status(400).send(`couldn't delete a calculator with id=${calculatorId}. calculator not found`);
        } else {
           res.json(deletedCalculator.Some);
        }
     });

    return app.listen();
});

function getCurrentDate() {
    const timestamp = new Number(ic.time());
    return new Date(timestamp.valueOf() / 1000_000);
}