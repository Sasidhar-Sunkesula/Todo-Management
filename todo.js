// models/todo.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static async addTask(params) {
      return await Todo.create(params);
    }

    static async showList() {
      try {
        console.log("My Todo list \n");

        console.log("Overdue");
        const overdueTodos = await Todo.overdue();
        displayTodos(overdueTodos);
        console.log("\n");

        console.log("Due Today");
        const dueTodayTodos = await Todo.dueToday();
        displayTodos(dueTodayTodos);
        console.log("\n");

        console.log("Due Later");
        const dueLaterTodos = await Todo.dueLater();
        displayTodos(dueLaterTodos);
      } catch (error) {
        console.error(error);
      }
    }

    static async overdue() {
      return await Todo.findAll({
        where: {
          dueDate: { [sequelize.Op.lt]: new Date() },
          completed: false,
        },
      });
    }

    static async dueToday() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return await Todo.findAll({
        where: {
          dueDate: { [sequelize.Op.gte]: today, [sequelize.Op.lt]: tomorrow },
          completed: false,
        },
      });
    }

    static async dueLater() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return await Todo.findAll({
        where: {
          [sequelize.Op.or]: [
            { dueDate: null },
            { dueDate: { [sequelize.Op.gte]: today } },
          ],
          completed: false,
        },
      });
    }

    static async markAsComplete(id) {
      const todo = await Todo.findByPk(id);

      if (!todo) {
        throw new Error(`Todo with id ${id} not found`);
      }

      todo.completed = true;
      await todo.save();
    }

    static associate(models) {
        Todo.belongsTo(models.User, { foreignKey: 'userId' }); 
      }
      
    
    displayableString() {
      let checkbox = this.completed ? "[x]" : "[ ]";
      return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
    }
  }

  const displayTodos = (todos) => {
    todos.forEach((todo) => {
      console.log(todo.displayableString());
    });
  };

  Todo.init({
    title: DataTypes.STRING,
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });

  return Todo;
};
