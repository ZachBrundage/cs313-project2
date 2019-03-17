CREATE TABLE users
(
    user_id SERIAL NOT NULL PRIMARY KEY,
    username varchar(80) NOT NULL UNIQUE,
    pass varchar(255) NOT NULL
);

CREATE TABLE budgets
(
    user_id int NOT NULL REFERENCES users(user_id),
    budget_id SERIAL NOT NULL PRIMARY KEY,
    gross_income float(2) NOT NULL,
    total_deductions float(2) NOT NULL,
    net_yearly float(2) NOT NULL,
    net_monthly float(2) NOT NULL,
    total_expenses float(2),
    savings float(2)
);

CREATE TABLE expenses
(
    budget_id int NOT NULL REFERENCES budgets(budget_id),
    expense_id SERIAL NOT NULL PRIMARY KEY,
    expense_name varchar(80) NOT NULL,
    projected_cost float(2) NOT NULL,
    actual_cost float(2) NOT NULL
);

INSERT INTO users (username, pass) VALUES ('SAMPLE', 'SAMPLE');

INSERT INTO budgets (user_id, gross_income, total_deductions, net_yearly, net_monthly, total_expenses, savings) values (1, 75000, 4325, 23100, 1925, 550, 1375);

INSERT INTO expenses (budget_id, expense_name, projected_cost, actual_cost) values (1, 'GAS', 75, 50);