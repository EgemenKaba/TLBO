this.rastrigin = function(x) {
    const a = 10;
    const b = 0.2;
    const c = 2 * Math.PI;

    let sum1 = 0;
    let sum2 = 0;

    for (let i = 0; i < x.length; i++) {
        sum1 = sum1 + Math.pow(x[i], 2);
        sum2 = sum2 + Math.cos(c * x[i]);
    };

    return - a * Math.exp(-b * Math.sqrt(1 / x.length * sum1)) - Math.exp(1 / x.length * sum2) + a + Math.exp(1) ;
};

this.cost = function(x) {
    return this.rastrigin(x);
};

this.nPopulation = 100;
this.nGenerations = 10;
this.nDesignVariables = 2;
this.nMin = -5.12;
this.nMax = 5.12;
this.population = [];
this.currentTeacher = {};
this.bestSolution = {
    cost: Number.POSITIVE_INFINITY
};

this.init = function() {
    for (let i = 0; i < nPopulation; i++) {
        let rndX = Math.random() * (nMax - nMin) + nMin;
        let rndY = Math.random() * (nMax - nMin) + nMin;
        let rndCst = this.cost([rndX, rndY]);

        this.population.push({
            position: {
                x: rndX,
                y: rndY
            },
            cost: rndCst
        });

        if (rndCst < bestSolution.cost) {
            bestSolution = this.population[i];
        };
    };
};

this.evaluate = function(element, newX, newY) {
    newX = Math.max(newX, this.nMin);
    newY = Math.max(newY, this.nMin);

    newX = Math.min(newX, this.nMax);
    newY = Math.min(newY, this.nMax);

    let newCost = this.cost([newX, newY]);

    if (newCost < element.cost) {
        element.cost = newCost;
        element.position.x = newX;
        element.position.y = newY;

        if (newCost < this.bestSolution.cost) {
            this.bestSolution = element;
        }
    }
};

this.TLBO = function() {
    this.teacher();
    this.student();
};

this.appointTeacher = function() {
    this.currentTeacher = {
        cost: Number.POSITIVE_INFINITY
    }

    this.population.forEach(element => {
        if (element.cost < this.currentTeacher.cost) {
            this.currentTeacher = element;
        }
    });
};

this.teachLearners = function() {
    // initiate
    let sumX = 0;
    let sumY = 0;

    this.population.forEach(element => {
        sumX += element.position.x;
        sumY += element.position.y;
    });

    let meanX = sumX / this.population.length;
    let meanY = sumY / this.population.length;

    // teacher
    this.population.forEach(element => {
        let teachingFactor = Math.floor(Math.random() * 2 + 1);
        let newX = element.position.x + Math.random() * this.currentTeacher.position.x - teachingFactor * meanX;
        let newY = element.position.y + Math.random() * this.currentTeacher.position.y - teachingFactor * meanY;

        this.evaluate(element, newX, newY);
    });
};

this.teacher = function() {
    // initiate
    let sumX = 0;
    let sumY = 0;
    this.currentTeacher = {
        cost: Number.POSITIVE_INFINITY
    };
    this.population.forEach(element => {
        sumX += element.position.x;
        sumY += element.position.y;

        if (element.cost < this.currentTeacher.cost) {
            this.currentTeacher = element;
        }
    });
    let meanX = sumX / this.population.length;
    let meanY = sumY / this.population.length;

    // teacher
    this.population.forEach(element => {
        let teachingFactor = Math.floor(Math.random() * 2 + 1);
        let newX = element.position.x + Math.random() * this.currentTeacher.position.x - teachingFactor * meanX;
        let newY = element.position.y + Math.random() * this.currentTeacher.position.y - teachingFactor * meanY;

        this.evaluate(element, newX, newY);
    });
};

this.student = function() {
    for (let k = 0; k < this.population.length; k++) {
        let element = this.population[k];

        let candidates = Array.apply(null, {length: this.population.length}).map(Number.call, Number);
        candidates.splice(k,1);
        let studentIndex = candidates[Math.floor(Math.random() * (this.population.length - 1))];

        let student = this.population[studentIndex];

        let stepX = element.position.x - student.position.x;
        let stepY = element.position.y - student.position.y;

        if (student.cost < element.cost) {
            stepX = -stepX;
            stepY = -stepY;
        }

        let newX = element.position.x + Math.random() * stepX;
        let newY = element.position.y + Math.random() * stepY;

        this.evaluate(element, newX, newY);
    };
};

this.TLBO_allGens = function() {
    for(let i = 0; i < this.nGenerations; i++) {
        this.TLBO();
    }
};

this.getBestSolution = function() {
    return this.bestSolution;
};

this.appendBestSolution = function() {
    document.getElementById("result").innerHTML = document.getElementById("result").innerHTML + "<br/>" + "cost: " + this.bestSolution.cost + " x: " + this.bestSolution.position.x + " y: " + this.bestSolution.position.y;
};

this.printBestSolution = function() {
    document.getElementById("result").innerHTML = "cost: " + this.bestSolution.cost + " x: " + this.bestSolution.position.x + " y: " + this.bestSolution.position.y;
};

this.main = function() {
    this.canvas = document.getElementById('vis').getContext('2d');
    this.init();
    this.drawCostFunction();
    this.drawPopulation();
};

this.drawTLBO = function() {
  this.canvas.clearRect(0, 0, 1024, 1024);
  this.drawCostFunction();
  this.drawPopulation();
  this.drawIndividual(this.currentTeacher.position.x, this.currentTeacher.position.y, 'green');
}

this.incrementStep = function() {
    this.TLBO();
    this.drawTLBO();
};

this.performAppointment = function() {
  this.appointTeacher();
  this.drawTLBO();
};

this.performTeaching = function() {
  this.teachLearners();
  this.drawTLBO();
};

this.performLearning = function() {
  this.student();
  this.drawTLBO();
}

this.drawIndividual = function(x, y, color) {
    this.canvas.fillStyle = color;
    this.canvas.fillRect((x + (this.nMax - this.nMin) / 2) * 100 - 2, (y + (this.nMax - this.nMin) / 2) * 100 - 2, 4, 4);
};

this.drawPopulation = function() {
    this.population.forEach(element => {
        this.drawIndividual(element.position.x, element.position.y, 'purple');
    });
};

this.drawCostFunction = function() {
    let pixels = [];
    let maxDepth = Number.NEGATIVE_INFINITY;
    let minDepth = Number.POSITIVE_INFINITY;

    for (let i = this.nMin; i < this.nMax; i += 0.01) {
        for (let j = this.nMin; j < this.nMax; j += 0.01) {
            let cost = this.cost([i, j]);
            if (cost > maxDepth) { maxDepth = cost; };
            if (cost < minDepth) { minDepth = cost; };

            pixels.push({
                x: (i+(this.nMax-this.nMin)/2)*100,
                y: (j+(this.nMax-this.nMin)/2)*100,
                cost: this.cost([i, j])
            });
        }
    };

    pixels.forEach(element => {
        let normalizedCost = (element.cost - minDepth) / (maxDepth - minDepth);
        let cost = Math.floor(normalizedCost * 255);

        this.canvas.fillStyle = 'rgb(' + cost + ', ' + cost + ',' + cost + ')';
        this.canvas.fillRect(element.x, element.y, 1, 1);
    });

    // best solution for rastrigin
    this.canvas.fillStyle = 'red'
    this.canvas.fillRect(512-2.5, 512-2.5, 5, 5);
};
