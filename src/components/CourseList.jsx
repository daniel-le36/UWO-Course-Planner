import React from "react";
import { List } from "semantic-ui-react";
const CourseList = ({
  courseList,
  removeCourse,
  removeFromList,
  listHeight,
}) => {
  return (
    <List
      style={{
        overflow: "auto",
        maxHeight: listHeight,
        minHeight: listHeight,
      }}
    >
      {courseList.map((course) => (
        <List.Item
          key={course.id}
          value={course.value}
          className="courseListItem"
        >
          <List.Content>
            <List.Header>
              {course.subject + " " + course.text}{" "}
              <List.Icon
                name="cancel"
                onClick={() => removeCourse(course.value, removeFromList)}
                color="violet"
              />
            </List.Header>
          </List.Content>
        </List.Item>
      ))}
    </List>
  );
};
export default CourseList;
