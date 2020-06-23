import React from "react";
import { Button, List, Modal, Header } from "semantic-ui-react";
const CourseModal = ({ modalOpen, modalContent, addCourse, closeModal }) => {
  return (
    <Modal open={modalOpen} onClose={closeModal}>
      <Modal.Header>{modalContent.courseData.title}</Modal.Header>
      <Modal.Content>
        <Modal.Description
          content={modalContent.courseData.description}
        ></Modal.Description>

        <Header>Courses this can be used as a prerequisite for:</Header>
        <List>
          {modalContent.newPrereqs.map((course) => (
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
          {modalContent.newAntireqs.map((course) => (
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
          value={modalContent.courseData.courseId}
          onClick={addCourse}
          content="Add This Course"
        />
      </Modal.Actions>
    </Modal>
  );
};
export default CourseModal;
