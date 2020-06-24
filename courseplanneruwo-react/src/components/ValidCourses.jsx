import React from "react";
import { Card, Header } from "semantic-ui-react";
import Filter from "./Filter";

function ValidCourses({
  availableSubjects,
  availableCourses,
  toggleNoPrereqs,
  openCourseModal,
}) {
  const [courseList, setCourseList] = React.useState(availableCourses);
  React.useEffect(() => {
    setCourseList(availableCourses);
    console.log(availableCourses);
  });
  const [filterSubjs, setFilterSubjs] = React.useState([]);

  // Remove subject to be filtered by
  const removeFilterSubj = (subjectId) => {
    const subjs = filterSubjs.filter(function (subj) {
      return subj.value !== subjectId;
    });
    setFilterSubjs(subjs);
  };

  // Add subject to be filtered by
  const addFilterSubj = (event, { value }) => {
    const subject = availableSubjects.find((subj) => subj.value === value);
    const subjs = [...filterSubjs];
    subjs.push(subject);
    setFilterSubjs(subjs);
  };

  // Get list of subjects that aren't currently being filtered (for subject dropdown)
  const getFilteredSubjList = () => {
    return availableSubjects.filter(
      (subj) => !filterSubjs.map((subj) => subj.value).includes(subj.value)
    );
  };
  const getFilteredCourses = () => {
    const subjIds = filterSubjs.map((subj) => subj.value);
    if (filterSubjs.length === 0) {
      return availableCourses;
    } else {
      return availableCourses.filter((course) =>
        subjIds.includes(course.subjectId)
      );
    }
  };
  return (
    <div id="ValidCourses">
      <Header as="h2" block id="ValidCoursesHeader">
        <Header.Content className="titleHeader">
          Courses You Can Take
        </Header.Content>
      </Header>
      <div>
        <Filter
          subjList={getFilteredSubjList()}
          filterBySubjects={filterSubjs}
          toggleNoPrereqs={toggleNoPrereqs}
          addFilterSubj={addFilterSubj}
          removeFilterSubj={removeFilterSubj}
        />
      </div>
      <div id="courseResults" className="ui cards">
        {getFilteredCourses().map((course) => (
          <Card
            className="courseCard"
            header={course.subject + " " + course.number + course.suffix}
            meta={course.name}
            description={course.description}
            link
            onClick={() => openCourseModal(course)}
          />
        ))}
      </div>
    </div>
  );
}
export default ValidCourses;
