import React from "react";
import "./App.css";
import CourseSelector from "./components/CourseSelector";
import { Dropdown, Button, List, Header, Icon } from "semantic-ui-react";

function App() {
  return (
    <div>
      <Header as="h1" dividing id="title">
        <Icon name="book" />
        <Header.Content className="titleHeader">
          Western Course Planner
        </Header.Content>
      </Header>
      <CourseSelector />
    </div>
  );
}

export default App;
