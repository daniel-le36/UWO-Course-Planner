import React, { Component } from "react";
import {
  Dropdown,
  Button,
  List,
  Card,
  Modal,
  Header,
  Accordion,
  Icon,
} from "semantic-ui-react";
class CourseSelector extends Component {
  state = {
    selectedCourses: [],
    courseList: [],
    availableCourses: [],
    modalOpen: false,
    modalContent: {
      courseData: { title: "", description: "", courseId: -1 },
      newPrereqs: [
        { code: "Computer Science 1234", name: "Finding if this works" },
        { code: "Computer Science 1234", name: "Finding if this works" },
        { code: "Computer Science 1234", name: "Finding if this works" },
      ],
      newAntireqs: [],
    },
    activeIndex: -1,
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
  addCourse = (event, { value }) => {
    const courseList = [...this.state.selectedCourses];
    courseList.push(value);
    fetch("http://127.0.0.1:5000/api/v1/resources/getvalidcourses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selection: courseList }),
    })
      .then((res) => res.json())
      .then((result) => {
        this.setState({
          availableCourses: result["availableCourses"],
          selectedCourses: courseList,
        });
      });
  };
  removeCourse = (value) => {
    const courseList = [
      ...this.state.selectedCourses.filter((x) => x !== value),
    ];
    this.setState({ selectedCourses: courseList });
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
        <Modal open={this.state.modalOpen} onClose={this.closeModal}>
          <Modal.Header>
            {this.state.modalContent.courseData.title}
          </Modal.Header>
          <Modal.Content>
            <Modal.Description
              content={this.state.modalContent.courseData.description}
            ></Modal.Description>

            <Header>Courses this can be used as a prerequisite for:</Header>
            <List>
              {this.state.modalContent.newPrereqs.map((course) => (
                <List.Item>
                  <List.Icon name="right triangle" />
                  <List.Content>
                    <List.Header>{course.code}</List.Header>
                    <List.Description>{course.name}</List.Description>
                  </List.Content>
                </List.Item>
              ))}
            </List>
            <Header>Courses this is an antirequisite for:</Header>
            <List>
              {this.state.modalContent.newAntireqs.map((course) => (
                <List.Item>
                  <List.Icon name="right triangle" />
                  <List.Content>
                    <List.Header>{course.code}</List.Header>
                    <List.Description>{course.name}</List.Description>
                  </List.Content>
                </List.Item>
              ))}
            </List>
          </Modal.Content>
          <Modal.Actions>
            <Button
              value={this.state.modalContent.courseData.courseId}
              onClick={this.addCourse}
              positive
              content="Add This Course"
            />
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

export default CourseSelector;
