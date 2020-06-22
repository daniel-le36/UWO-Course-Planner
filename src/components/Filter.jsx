import React from "react";
import { Form, Icon, Label } from "semantic-ui-react";
function Filter({
  subjList,
  filterBySubjects,
  toggleNoPrereqs,
  addFilterSubj,
  removeFilterSubj,
}) {
  /* const [open, setOpen] = React.useState(filterBySubjects);
  const close = () => {
    setOpen([]);
  }; */
  return (
    <Form>
      <Form.Group>
        <Form.Dropdown
          placeholder="Filter by Subjects"
          fluid
          search
          selectOnNavigation={false}
          selection
          value=""
          selectOnBlur={false}
          noResultsMessage="No courses found"
          onChange={addFilterSubj}
          options={subjList}
        ></Form.Dropdown>
      </Form.Group>
      <Form.Group>
        {filterBySubjects.map((subject) => (
          <Label as="a" icon onClick={() => removeFilterSubj(subject.value)}>
            {subject.text}
            <Icon name="close" />
          </Label>
        ))}
      </Form.Group>
      <Form.Group>
        <Form.Checkbox
          toggle
          label="Include courses with no prerequisites"
          onChange={toggleNoPrereqs}
        />
        <Form.Checkbox toggle label="Show only essay courses" />
      </Form.Group>
    </Form>
  );
}
export default Filter;
