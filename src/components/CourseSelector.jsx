import React, { Component } from "react";
import CourseModal from "./CourseModal";
import ValidCourses from "./ValidCourses";
import CourseList from "./CourseList";
import { Dropdown, Button, List, Header } from "semantic-ui-react";
class CourseSelector extends Component {
  state = {
    allChosenCourses: [], // Master list of selected courses
    selectedCourses: [],
    courseList: [],
    availableCourses: [],
    modalOpen: false,
    modalContent: {
      courseData: { title: "", description: "", courseId: -1 },
      newPrereqs: [],
      newAntireqs: [],
    },
    activeIndex: -1,
    noPrereqs: false,
    filterBySubjects: [],
    availableSubjects: [],
    filteredSubjs: [],
    chosenSubj: -1,
    subjList: [],
    chosenCourses: [], //Temporary list of courses before they are added
    plannedCourses: [], //List of courses added from the valid courses section
  };
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
      "http://127.0.0.1:5000/api/v1/resources/prereqsandantireqs?courseId=" +
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
  getValidCourses = () => {
    fetch("http://127.0.0.1:5000/api/v1/resources/getvalidcourses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        selection: this.state.allChosenCourses,
        includeNoPrereqs: this.state.noPrereqs,
      }),
    })
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
  addCourse = (event, { value }) => {
    const courseList = [...this.state.chosenCourses];
    courseList.push(value);
    const allCourses = [...this.state.allChosenCourses];
    allCourses.push(value);
    this.setState({ chosenCourses: courseList, allChosenCourses: allCourses });
  };
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
        this.setState(
          { allChosenCourses: courseList, chosenCourses: listToRemoveFrom },
          this.getValidCourses()
        );
        break;
      case "taken":
        listToRemoveFrom = [
          ...this.state.selectedCourses.filter((x) => x !== value),
        ];
        this.setState(
          { allChosenCourses: courseList, selectedCourses: listToRemoveFrom },
          this.getValidCourses()
        );
        break;
      case "planned":
        listToRemoveFrom = [
          ...this.state.plannedCourses.filter((x) => x !== value),
        ];
        this.setState(
          { allChosenCourses: courseList, plannedCourses: listToRemoveFrom },
          this.getValidCourses()
        );
        break;
    }
  };

  componentDidMount() {
    fetch("http://127.0.0.1:5000/api/v1/resources/courses")
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
              /*course.subject +
              " " +*/
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
      <div>
        <div id="CourseLists">
          <div style={{ width: "40%" }}>
            <Header as="h3" className="courseListHeader">
              Choose Courses You've Taken
            </Header>

            <Dropdown
              style={{ width: "40%" }}
              placeholder="Choose Subject"
              search
              selectOnNavigation={false}
              selection
              selectOnBlur={false}
              noResultsMessage="No subjects found"
              onChange={this.chooseSubj}
              options={this.state.subjList}
            />

            <Dropdown
              style={{ width: "60%" }}
              placeholder="Search for Courses"
              search
              floating
              selectOnNavigation={false}
              selection
              value=""
              selectOnBlur={false}
              noResultsMessage="No courses found"
              onChange={this.addCourse}
              options={this.displayCourses()}
            />
            <CourseList
              courseList={this.state.courseList.filter((i) =>
                this.state.chosenCourses.includes(i.value)
              )}
              removeCourse={this.removeCourse}
              removeFromList="chosen"
            />

            <Button
              style={{ display: "block" }}
              onClick={this.addChosenCourseToTakenList}
            >
              Add Course(s)
            </Button>
          </div>
          <div style={{ width: "30%" }}>
            <Header as="h3" className="courseListHeader">
              Courses You've Taken
            </Header>

            <CourseList
              courseList={this.state.courseList.filter((i) =>
                this.state.selectedCourses.includes(i.value)
              )}
              removeCourse={this.removeCourse}
              removeFromList="taken"
            />
          </div>
          <div style={{ width: "30%" }}>
            <Header as="h3" className="courseListHeader">
              Planned Courses
            </Header>
            <CourseList
              courseList={this.state.courseList.filter((i) =>
                this.state.plannedCourses.includes(i.value)
              )}
              removeCourse={this.removeCourse}
              removeFromList="planned"
            />
            {/* <List selection style={{ maxHeight: 150, overflow: "auto" }}>
              {this.state.courseList
                .filter((i) => this.state.plannedCourses.includes(i.value))
                .map((course) => (
                  <List.Item
                    key={course.id}
                    value={course.value}
                    onClick={() => this.removeCourse(course.value)}
                  >
                    <List.Content>
                      <List.Header>
                        {course.subject + " " + course.text}
                      </List.Header>
                    </List.Content>
                  </List.Item>
                ))}
            </List> */}
          </div>
        </div>
        <div className="CourseSelect">
          <div></div>
        </div>
        <ValidCourses
          availableSubjects={this.state.availableSubjects}
          availableCourses={this.state.availableCourses}
          toggleNoPrereqs={this.toggleNoPrereqs}
          openCourseModal={this.openCourseModal}
        />
        <CourseModal
          modalOpen={this.state.modalOpen}
          modalContent={this.state.modalContent}
          addCourse={this.addCourse}
          closeModal={this.closeModal}
        />
      </div>
    );
  }
}

export default CourseSelector;
