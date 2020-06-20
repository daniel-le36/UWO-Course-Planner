import React, { Component } from "react";
import CourseModal from "./CourseModal";
import Filter from "./Filter";
import {
  Dropdown,
  Button,
  List,
  Card,
  Modal,
  Header,
  Accordion,
  Icon,
  Checkbox,
  Form,
  Label,
} from "semantic-ui-react";
class CourseSelector extends Component {
  state = {
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
    filterBySubjects: ["Computer Science", "Calculus"],
    availableSubjects: [
      {
        id: "Computer Science",
        value: "Computer Science",
        text: "Computer Science",
      },
      { id: "Computer Science", value: "Computer Science", text: "Calculus" },
    ],
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

  closeModal = () => {
    this.setState({ modalOpen: false });
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
  getValidCourses = (courseList) => {
    fetch("http://127.0.0.1:5000/api/v1/resources/getvalidcourses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        selection: courseList,
        includeNoPrereqs: this.state.noPrereqs,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        this.setState({
          availableCourses: result["availableCourses"],
          selectedCourses: courseList,
          modalOpen: false,
        });
      });
  };

  addCourse = (event, { value }) => {
    const courseList = [...this.state.selectedCourses];
    courseList.push(value);
    this.getValidCourses(courseList);
  };
  removeCourse = (value) => {
    const courseList = [
      ...this.state.selectedCourses.filter((x) => x !== value),
    ];
    this.getValidCourses(courseList);
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
            newCourse.text =
              course.subject +
              " " +
              course.number.toString() +
              course.suffix +
              " - " +
              course.name;
            return newCourse;
          });
          this.setState({
            courseList: courseList,
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
        <div className="CourseSelect">
          <div>
            <Dropdown
              placeholder="Search for Courses"
              fluid
              search
              selectOnNavigation={false}
              selection
              value=""
              selectOnBlur={false}
              noResultsMessage="No courses found"
              onChange={this.addCourse}
              options={this.state.courseList.filter(
                (i) => !this.state.selectedCourses.includes(i.value)
              )}
            />
          </div>
          <div>
            <List selection style={{ maxHeight: 150, overflow: "auto" }}>
              {this.state.courseList
                .filter((i) => this.state.selectedCourses.includes(i.value))
                .map((course) => (
                  <List.Item
                    key={course.id}
                    value={course.value}
                    onClick={() => this.removeCourse(course.value)}
                  >
                    <List.Content>
                      <List.Header>{course.text}</List.Header>
                    </List.Content>
                  </List.Item>
                ))}
            </List>
          </div>
        </div>
        <div>
          <Filter
            availableSubjects={this.state.availableSubjects}
            filterBySubjects={this.state.filterBySubjects}
            toggleNoPrereqs={this.toggleNoPrereqs}
          />
        </div>
        <div id="courseResults">
          {this.state.availableCourses.map((course) => (
            <Card
              className="courseCard"
              header={course.subject + " " + course.number + course.suffix}
              meta={course.name}
              description={course.description}
              link
              onClick={() => this.openCourseModal(course)}
            />
          ))}
        </div>
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
