# UWO Course Planner

Web application for helping Western University students find out exactly what courses they have the prerequisites for. This way, they can search for courses to take without needing to continually verify if they meet the prerequisites or have antirequisites.

## Getting Started

This project is built with React and Python Flask so you will need these to run the project. A Docker file will be available soon.

### Running

In the courseplanneruwo-server folder run the _app.py_ file to start the server

In the courseplanneruwo-react folder run these commands

```
npm install
npm start
```

## Built With

- React
- Python Flask
- SQLite

## Database schema

#### Subject

- SubjectId
- Name

#### Course

- CourseId
- Code
- SubjectId
- Suffix
- Name
- Description
- IsEssay
- Weight/Year

#### Antireq (AntireqId/)

- AntireqId
- CourseId
- AntireqCourseId
  - Id of the course that is an antirequisite for this course

#### Prereq

- PrereqId
  - A course can have multiple entries in this table if there are multiple groups of conditions that can be used to satisfy the prerequisites
  - Ex: A course's prerequisite can be fulfilled by either one Computer Science course and two Math courses or one Integrated Science course. There would be one entry in the table for the Computer Science and Math requirement and one entry for the Integrated Science requirement
- CourseId
  - ID of the course that this prereq belongs to
- Quantity
  - The number of conditions that must be met to satisfy this prereq

#### PrereqDetail

Aside from PrereqDetailId, PrereqId, and Value, any of these columns can be null. When this table is queried, a COALESCE statement is used to match selected courses only with the appropriate non-null rows

- PrereqDetailId
  - There can be multiples of the same PrereqDetailIds. For example, if one condition is one of: CS1026,CS1027, and CS1028, then they would all share the same PrereqDetailId
- PrereqId
  - The prereq group these individual conditions belong to
- CourseId
  - The ID of the course that fulfills this condition
- SubjectId
  - The ID of the subject that fulfills this condition
- IsEssay
  - Indicates that this is an essay course requirement
- Year
  - Indicates a year requirement. For example, this would be 2 and IsEssay would be True if one prerequisite was to have a second year essay course
- Value
  - The total weight of courses to fulfill a condition. For example, if one condition is one of: CS1026,CS1027, and CS1028, Value would be 0.5 since you only need 0.5 worth of courses to satisfy this condition
