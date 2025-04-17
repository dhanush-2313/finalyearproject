// SPDX-License-Identifier: MIT


pragma solidity ^0.8.0;

contract FieldWorker {
    struct Task {
        uint taskId;
        string description;
        address assignedTo;
        bool completed;
    }

    mapping(uint => Task) public tasks;
    uint public nextTaskId;

    event TaskAssigned(uint taskId, address fieldWorker, string description);
    event TaskCompleted(uint taskId);

    // Function to create a new task
    function createTask(string memory description, address assignedTo) public {
        tasks[nextTaskId] = Task(nextTaskId, description, assignedTo, false);
        emit TaskAssigned(nextTaskId, assignedTo, description);
        nextTaskId++;
    }

    // Function to mark a task as completed
    function completeTask(uint taskId) public {
        require(tasks[taskId].assignedTo == msg.sender, "You are not assigned to this task.");
        tasks[taskId].completed = true;
        emit TaskCompleted(taskId);
    }

    // Function to get task details
    function getTaskDetails(uint taskId) public view returns (Task memory) {
        return tasks[taskId];
    }
}
