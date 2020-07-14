from flask import Flask, request, jsonify
import sqlite3
import json
from flask_cors import CORS, cross_origin
import collections


class Course:
    def __init__(self, courseId, number, subject, suffix, name, description="",subjectId=-1):
        self.courseId = courseId
        self.number = number
        self.subject = subject
        self.suffix = suffix
        self.name = name
        self.description = description
        self.subjectId = subjectId

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

def getSubjects():
    conn = sqlite3.connect('CourseHelper.db')
    conn.row_factory = lambda cursor, row: {'subjectId': row[0], 'subject': row[1]}
    c = conn.cursor()
    c.execute("SELECT SubjectId, Name FROM Subject")
    allSubjs = c.fetchall()
    conn.close()
    return allSubjs

def getPrereqs(courseId):
    qry = open('getprereqs.sql', 'r').read()
    conn = sqlite3.connect('CourseHelper.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute(qry, (courseId,))
    courses = c.fetchall()
    conn.close()
    courseList = []
    for course in courses:
        newCourse = Course(course['CourseId'], course['Number'],
                           course['SubjectName'], course['Suffix'], course['Name'])
        courseList.append(newCourse)
    return[ob.__dict__ for ob in courseList]
    
def getAntireqs(courseId):
    conn = sqlite3.connect('CourseHelper.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT CourseId,Subject.Name as SubjectName,Courses.Name,Number,Suffix FROM Subject JOIN (SELECT * FROM Course JOIN (SELECT CourseId FROM Antireq WHERE AntireqCourseId = ?) as chosenCourse ON chosenCourse.CourseId = Course.CourseId) as Courses ON Courses.SubjectId = Subject.SubjectId", (courseId,))
    courses = c.fetchall()
    conn.close()
    courseList = []
    for course in courses:
        newCourse = Course(course['CourseId'], course['Number'],
                           course['SubjectName'], course['Suffix'], course['Name'])
        courseList.append(newCourse)
    return [ob.__dict__ for ob in courseList]
@app.route('/', methods=['GET'])
def home():
    return '''<h1>Distant Reading Archive</h1>
<p>A prototype API for distant reading of science fiction novels.</p>'''


@app.route('/api/v1/resources/courses', methods=['GET'])
@cross_origin()
def getCourses():
    conn = sqlite3.connect('CourseHelper.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT CourseId, Subject.Name as SubjectName, Number, Suffix, Course.Name,Course.SubjectId FROM Course JOIN Subject on Course.SubjectId = Subject.SubjectId")
    courses = c.fetchall()
    courseList = []
    for course in courses:
        newCourse = Course(course['CourseId'], course['Number'],
                           course['SubjectName'], course['Suffix'], course['Name'],"",course['SubjectId'])
        courseList.append(newCourse)
    allCourses = [ob.__dict__ for ob in courseList]
    allSubjs = getSubjects()
    return {"allCourses": allCourses,"allSubjs":allSubjs}


@app.route('/api/v1/resources/getvalidcourses', methods=['POST'])
def getValidCourses():
    requestData = request.get_json()
    chosenCourses = requestData["selection"]
    # Choose query depending if courses with no prereqs will be included
    if requestData["includeNoPrereqs"] == True:
        qry = open('getcoursesnoprereqs.sql', 'r').read()
    else:
        qry = open('getcourses.sql', 'r').read()
    conn = sqlite3.connect('CourseHelper.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute(qry.format(', '.join('?' for _ in chosenCourses),
                         ', '.join('?' for _ in chosenCourses),', '.join('?' for _ in chosenCourses)), chosenCourses+chosenCourses+chosenCourses)
    courses = c.fetchall()
    conn.close()
    courseList = []
    subjectDict = {}
    # Map query data to Course object
    for course in courses:
        newCourse = Course(course['CourseId'], course['Number'],
                           course['SubjectName'], course['Suffix'], course['Name'],course['Description'],course['SubjectId'])
        courseList.append(newCourse)
        subjectDict[course['SubjectId']] = course['SubjectName']
    availableCourses = [ob.__dict__ for ob in courseList]
    subjectList =  [ {'subjectId':k,'subjectName':v} for k, v in subjectDict.items() ]
    #subjectList.append({'subjectId':12,'subjectName':"Calculus"})
    return{"availableCourses": availableCourses, "subjectList":subjectList}

@app.route('/api/v1/resources/prereqsandantireqs',methods=['GET'])
@cross_origin()
def getPrereqsAndAntireqs():
    courseId = request.args.get('courseId')
    prereqs = getPrereqs(courseId)
    antireqs = getAntireqs(courseId)
    return {"prereqCourses":prereqs,"antireqCourses":antireqs}
app.run()
