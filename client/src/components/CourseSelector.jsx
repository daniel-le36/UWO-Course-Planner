import React, { Component } from "react";
import CourseModal from "./CourseModal";
import ValidCourses from "./ValidCourses";
import CourseList from "./CourseList";
import { Dropdown, Button, List, Header } from "semantic-ui-react";

//Terms used:
// Valid Course: A course that can be taken because the user has the prerequisites for
// Taken Course: A course that the user has taken
// Staged Course: A course that the user has chosen from the dropdown but hasn't been added to the list of taken courses
// Planned Course: A valid course that the user has added to their plan
class CourseSelector extends Component {
  state = {
    allChosenCourses: [], // Master list of chosen courses (includes taken, staged, and planned courses)
    selectedCourses: [], // List of taken courses
    courseList: [],
    availableCourses: [], // List of valid courses
    modalOpen: false, // Modal will display what courses a valid course can be used as a prerequisite or antirequisite
    modalContent: {
      courseData: { title: "", description: "", courseId: -1 },
      newPrereqs: [],
      newAntireqs: [],
    },
    activeIndex: -1,
    noPrereqs: false, // Sets whether to display valid courses with no prerequisites
    availableSubjects: [], // List of subjects from the valid courses
    filteredSubjs: [],
    chosenSubj: -1, // ID of the subject to filter the courses in the dropdown by
    subjList: [], // List of the subjects for the courses in the dropdown
    chosenCourses: [], //Temporary list of courses before they are added
    plannedCourses: [], //List of courses added from the valid courses section
  };

  // Toggle whether to include courses that have no prerequisites. Updates valid course list
  toggleNoPrereqs = () => {
    const noprereqs = this.state.noPrereqs;
    this.setState(
      {
        noPrereqs: !noprereqs,
      },
      () => {
        const courseList = [...this.state.selectedCourses];
        this.getValidCourses(courseList);
      }
    );
  };
  chooseSubj = (event, { value }) => {
    const selSubj = value;
    this.setState({ chosenSubj: selSubj });
  };
  closeModal = () => {
    this.setState({ modalOpen: false });
  };
  displayCourses = () => {
    const filteredCourses = this.state.courseList
      .filter((i) => !this.state.allChosenCourses.includes(i.value))
      .filter((course) => course.subjectId === this.state.chosenSubj);
    return filteredCourses;
  };
  addChosenCourseToTakenList = () => {
    const chosenCourses = [...this.state.chosenCourses];
    const takenCourses = [...this.state.selectedCourses];
    this.setState(
      {
        chosenCourses: [],
        selectedCourses: takenCourses.concat(chosenCourses),
      },
      this.getValidCourses()
    );
  };
  openCourseModal = (course) => {
    const newCourseData = { ...this.state.modalContent };
    newCourseData.courseData.title =
      course.subject +
      " " +
      course.number +
      course.suffix +
      " - " +
      course.name;
    newCourseData.courseData.description = course.description;
    newCourseData.courseData.courseId = course.courseId;

    fetch(
      "https://i9fj9rd3gk.execute-api.us-east-1.amazonaws.com/dev/prereqsandantireqs?courseId=" +
        course.courseId
    )
      .then((res) => res.json())
      .then(
        (result) => {
          newCourseData.newPrereqs = result.prereqCourses.map((course) => {
            const newPrereq = {};
            newPrereq.code =
              course.subject + " " + course.number + course.suffix;
            newPrereq.name = course.name;
            return newPrereq;
          });
          newCourseData.newAntireqs = result.antireqCourses.map((course) => {
            const newAntireq = {};
            newAntireq.code =
              course.subject + " " + course.number + course.suffix;
            newAntireq.name = course.name;
            return newAntireq;
          });
          this.setState({ modalOpen: true, modalContent: newCourseData });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log("yeet");
        }
      );
  };

  // Gets the list of valid courses that can be taken based on the given courses already taken
  getValidCourses = () => {
    fetch(
      "https://i9fj9rd3gk.execute-api.us-east-1.amazonaws.com/dev/getvalidcourses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selection: this.state.allChosenCourses,
          includeNoPrereqs: this.state.noPrereqs, // Indicates whether courses with no prereqs should be fetched
        }),
      }
    )
      .then((res) => res.json())
      .then((result) => {
        this.setState({
          availableCourses: result["availableCourses"],
          modalOpen: false,
          availableSubjects: result["subjectList"].map((subject) => {
            const newSubject = {};
            newSubject.key = subject.subjectId;
            newSubject.value = subject.subjectId;
            newSubject.text = subject.subjectName;
            return newSubject;
          }),
        });
      });
  };

  // Add selected course to the staging list without updating the valid courses list
  addCourse = (event, { value }) => {
    const courseList = [...this.state.chosenCourses];
    courseList.push(value);
    const allCourses = [...this.state.allChosenCourses];
    allCourses.push(value);
    this.setState({ chosenCourses: courseList, allChosenCourses: allCourses });
  };

  // Add the courses from the staging list and update the valid course list
  addPlannedCourse = (event, { value }) => {
    const courseList = [...this.state.plannedCourses];
    courseList.push(value);
    const allCourses = [...this.state.allChosenCourses];
    allCourses.push(value);
    this.setState(
      { plannedCourses: courseList, allChosenCourses: allCourses },
      () => {
        this.getValidCourses();
      }
    );
  };

  // Remove a course from one of the three lists
  removeCourse = (value, removeFromList) => {
    const courseList = [
      ...this.state.allChosenCourses.filter((x) => x !== value),
    ];
    let listToRemoveFrom = [];
    switch (removeFromList) {
      case "chosen":
        listToRemoveFrom = [
          ...this.state.chosenCourses.filter((x) => x !== value),
        ];
        this.setState({
          allChosenCourses: courseList,
          chosenCourses: listToRemoveFrom,
        });
        break;
      case "taken":
        listToRemoveFrom = [
          ...this.state.selectedCourses.filter((x) => x !== value),
        ];
        this.setState(
          { allChosenCourses: courseList, selectedCourses: listToRemoveFrom },
          () => {
            this.getValidCourses();
          }
        );
        break;
      case "planned":
        listToRemoveFrom = [
          ...this.state.plannedCourses.filter((x) => x !== value),
        ];
        this.setState(
          { allChosenCourses: courseList, plannedCourses: listToRemoveFrom },
          () => {
            this.getValidCourses();
          }
        );
        break;
    }
  };

  componentDidMount() {
    fetch("https://i9fj9rd3gk.execute-api.us-east-1.amazonaws.com/dev/courses")
      .then((res) => res.json())
      .then(
        (result) => {
          const courseList = result.allCourses.map((course) => {
            const newCourse = {};
            newCourse.key = course.courseId;
            newCourse.value = course.courseId;
            newCourse.subjectId = course.subjectId;
            newCourse.subject = course.subject;
            newCourse.text =
              course.number.toString() + course.suffix + " - " + course.name;
            return newCourse;
          });
          const subjList = result.allSubjs.map((subj) => {
            const newSubj = {};
            newSubj.key = subj.subjectId;
            newSubj.value = subj.subjectId;
            newSubj.text = subj.subject;
            return newSubj;
          });
          this.setState({
            courseList: courseList,
            subjList: subjList,
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log("yeet");
        }
      );
  }

  render() {
    return (
      <div id="CourseSelection">
        <div id="CourseListSection">
          <div className={"courseListNoFilter"}>
            <Header as="h3" className="courseListHeader">
              <Header.Content>Choose Courses You've Taken</Header.Content>
            </Header>

            <Dropdown /*Dropdown to filter the list of courses by subject*/
              id="SubjectFilter"
              placeholder="Choose Subject"
              search
              selectOnNavigation={false}
              selection
              selectOnBlur={false}
              noResultsMessage="No subjects found"
              onChange={this.chooseSubj}
              options={this.state.subjList}
            />

            <Dropdown /*Dropdown to choose a course to add as a staged course*/
              placeholder="Search for Courses"
              search
              fluid
              floating
              selectOnNavigation={false}
              selection
              value=""
              selectOnBlur={false}
              noResultsMessage="No courses found"
              onChange={this.addCourse}
              options={this.displayCourses()}
            />
            <CourseList /*List of staged courses picked*/
              courseList={this.state.courseList.filter((i) =>
                this.state.chosenCourses.includes(i.value)
              )}
              removeCourse={this.removeCourse}
              removeFromList="chosen"
              listHeight="150px"
            />

            <Button /*Button to add staged courses to the list of taken courses*/
              id="addButton"
              style={{ display: "block" }}
              onClick={this.addChosenCourseToTakenList}
            >
              Add Course(s)
            </Button>
          </div>
          <div className="courseListNoFilter">
            <Header as="h3" className="courseListHeader">
              <Header.Content>Courses You've Taken</Header.Content>
            </Header>

            <CourseList /*List of taken courses*/
              courseList={this.state.courseList.filter((i) =>
                this.state.selectedCourses.includes(i.value)
              )}
              removeCourse={this.removeCourse}
              removeFromList="taken"
              listHeight="250px"
            />
          </div>
          <div className="courseListNoFilter">
            <Header as="h3" className="courseListHeader">
              <Header.Content>Planned Courses</Header.Content>
            </Header>
            <CourseList /*List of planned courses*/
              courseList={this.state.courseList.filter((i) =>
                this.state.plannedCourses.includes(i.value)
              )}
              removeCourse={this.removeCourse}
              removeFromList="planned"
              listHeight="250px"
            />
          </div>
        </div>

        <ValidCourses /*List of valid courses that can be taken*/
          availableSubjects={this.state.availableSubjects}
          availableCourses={this.state.availableCourses}
          toggleNoPrereqs={this.toggleNoPrereqs}
          openCourseModal={this.openCourseModal}
        />
        <CourseModal
          modalOpen={this.state.modalOpen}
          modalContent={this.state.modalContent}
          addCourse={this.addPlannedCourse}
          closeModal={this.closeModal}
        />
      </div>
    );
  }
}

export default CourseSelector;
