// Import required modules
import express from 'express';
import { Server, StableBTreeMap, ic } from 'azle';
import { v4 as uuidv4 } from 'uuid';

// Define the Calculator record structure
interface Calculator {
    id: string;
    number: number;
    numberBefore: number;
    createdAt: Date;
    updatedAt: Date | null;
}

// Initialize a database for calculator records
const calculatorStorage = StableBTreeMap<string, Calculator>(0);

// Create an Express server
export default Server(() => {
    const app = express();
    app.use(express.json());

    // Middleware to save history for calculator operations
    app.use("/calculator/:id", (req, res, next) => {
        const calculatorId = req.params.id;
        const excludedEndpoints = ['/send/', '/undo']; // Endpoints to exclude
        const shouldExclude = excludedEndpoints.some(endpoint => req.originalUrl.includes(endpoint));
        if (!shouldExclude) {
            const calculator = calculatorStorage.get(calculatorId);
            if (calculator === null) {
                res.status(404).send(`Calculator with id=${calculatorId} not found`);
            } else {
                calculator.numberBefore = calculator.number;
                calculatorStorage.insert(calculatorId, calculator);
                next();
            }
        } else {
            next(); // Skip
        }
    });

    // Endpoint to create a new calculator
    app.post("/calculator", (req, res) => {
        const calculator: Calculator = {
            id: uuidv4(),
            number: 0,
            createdAt: getCurrentDate(),
            updatedAt: null,
            ...req.body
        };
        calculatorStorage.insert(calculator.id, calculator);
        res.json(calculator);
    });

    // Endpoint to retrieve all calculators
    app.get("/calculator", (req, res) => {
        res.json(calculatorStorage.values());
    });

    // Endpoint to retrieve a calculator by ID
    app.get("/calculator/:id", (req, res) => {
        const calculatorId = req.params.id;
        const calculator = calculatorStorage.get(calculatorId);
        if (calculator === null) {
            res.status(404).send(`Calculator with id=${calculatorId} not found`);
        } else {
            res.json(calculator);
        }
    });

    // Function to update a calculator value
    const updateCalculatorValue = (req: express.Request, res: express.Response, operation: (number: number, value: number) => number) => {
        const calculatorId = req.params.id;
        const value = req.body.value;
        const calculator = calculatorStorage.get(calculatorId);
        if (calculator === null) {
            res.status(404).send(`Calculator with id=${calculatorId} not found`);
        } else {
            calculator.number = operation(calculator.number, value);
            calculator.updatedAt = getCurrentDate();
            calculatorStorage.insert(calculatorId, calculator);
            res.json(calculator);
        }
    };

    // Endpoint to perform addition
    app.put("/calculator/:id/add", (req, res) => {
        updateCalculatorValue(req, res, (number, value) => number + value);
    });

    // Endpoint to perform subtraction
    app.put("/calculator/:id/subtract", (req, res) => {
        updateCalculatorValue(req, res, (number, value) => number - value);
    });

    // Endpoint to perform multiplication
    app.put("/calculator/:id/multiply", (req, res) => {
        updateCalculatorValue(req, res, (number, value) => number * value);
    });

    // Endpoint to perform division
    app.put("/calculator/:id/divide", (req, res) => {
        const calculatorId = req.params.id;
        const value = req.body.value;
        if (value === 0) {
            res.status(400).send("Division by zero is not allowed");
        } else {
            updateCalculatorValue(req, res, (number, value) => number / value);
        }
    });

    // Function to perform square (^2)
    const square = (number: number) => Math.pow(number, 2);

    // Endpoint to perform square
    app.put("/calculator/:id/square", (req, res) => {
        updateCalculatorValue(req, res, square);
    });

    // Function to perform square root
    const squareRoot = (number: number) => Math.sqrt(number);

    // Endpoint to perform square root
    app.put("/calculator/:id/squareroot", (req, res) => {
        updateCalculatorValue(req, res, squareRoot);
    });

    // Function to increment by 1
    const increment = (number: number) => number + 1;

    // Endpoint to increment
    app.put("/calculator/:id/increment", (req, res) => {
        updateCalculatorValue(req, res, increment);
    });

    // Function to decrement by 1
    const decrement = (number: number) => number - 1;

    // Endpoint to decrement
    app.put("/calculator/:id/decrement", (req, res) => {
        updateCalculatorValue(req, res, decrement);
    });

    // Endpoint to send number from source to target
    app.put("/calculator/:sourceId/send/:targetId", (req, res) => {
        const sourceCalculatorId = req.params.sourceId;
        const targetCalculatorId = req.params.targetId;
    
        const sourceCalculator = calculatorStorage.get(sourceCalculatorId);
        const targetCalculator = calculatorStorage.get(targetCalculatorId);
    
        if (sourceCalculator === null) {
            res.status(404).send(`Source Calculator with id=${sourceCalculatorId} not found`);
        } else if (targetCalculator === null) {
            res.status(404).send(`Target Calculator with id=${targetCalculatorId} not found`);
        } else {
            targetCalculator.numberBefore = targetCalculator.number;
            targetCalculator.number = sourceCalculator.number;
    
            const currentDate = getCurrentDate();
            sourceCalculator.updatedAt = currentDate;
            targetCalculator.updatedAt = currentDate;
    
            calculatorStorage.insert(sourceCalculatorId, sourceCalculator);
            calculatorStorage.insert(targetCalculatorId, targetCalculator);
    
            res.json(targetCalculator);
        }
    });

    // Endpoint to delete all calculators
    app.delete("/calculators/deleteall", (req, res) => {
        calculatorStorage.clear();
        res.send("All calculators deleted successfully");
    });

    // Endpoint to delete a calculator by ID
    app.delete("/calculator/:id", (req, res) => {
        const calculatorId = req.params.id;
        const deletedCalculator = calculatorStorage.remove(calculatorId);
        if (deletedCalculator === null) {
            res.status(400).send(`Couldn't delete calculator with id=${calculatorId}. Calculator not found`);
        } else {
            res.json(deletedCalculator);
        }
    });

    // Start the Express server
    return app.listen();
});

// Function to get the current date
function getCurrentDate() {
    return new Date(ic.time().toBigInt() / 1000000);
}
