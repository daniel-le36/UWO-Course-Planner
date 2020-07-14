import csv
import sqlite3
import json
import math
import requests

# Get the course data from Andy's scraper API
# response = requests.get(
#   "https://fpeurz1on1.execute-api.us-east-2.amazonaws.com/prod")
# courseData = response.json()['body']


# Wipes all data from the DB and loads it all back in
def reloadAllData():
    conn = sqlite3.connect('courseplanneruwo-server/CourseHelper.db')
    c = conn.cursor()
    c.execute("DELETE FROM Subject")
    c.execute("DELETE FROM COURSE")
    c.execute("UPDATE sqlite_sequence SET seq=0 WHERE name='Subject'")
    c.execute("UPDATE sqlite_sequence SET seq=0 WHERE name='Course'")
    conn.commit()
    conn.close()
    loadSubjects()
    loadCourses()

# Load all subject data back into the Subject table


def loadSubjects():
    subjDict = {}
    subjsToInsert = []
    with open('courses.csv', encoding='utf-8-sig') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        headers = next(csv_reader)
        for row in csv_reader:
            name = row[0]
            if name not in subjDict:
                subjDict[name] = 0
                subjsToInsert.append((name, "",""))
        conn = sqlite3.connect('courseplanneruwo-server/CourseHelper.db')
        c = conn.cursor()
        c.executemany("INSERT INTO Subject VALUES (NULL,?,?,?)", subjsToInsert)
        conn.commit()
        conn.close()

# Get a dictionary of all the subjects and IDs


def getSubjectIds():
    subjectDict = {}
    conn = sqlite3.connect('courseplanneruwo-server/CourseHelper.db')
    c = conn.cursor()
    c.execute("SELECT * FROM Subject")
    subjects = c.fetchall()
    conn.close()
    for subject in subjects:
        subjectDict[subject[1]] = subject[0]
    return subjectDict

# Load all course data back into the Course table from CSV


def loadCourses():
    subjectDict = getSubjectIds()
    
    courses = []
    with open('courses.csv', encoding='utf-8-sig') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        headers = next(csv_reader)
        for row in csv_reader:
            newCourse = (row[1], subjectDict[row[0]], row[2], row[3], row[4],row[5],row[6],row[7])
            courses.append(newCourse)
        conn = sqlite3.connect('courseplanneruwo-server/CourseHelper.db')
        c = conn.cursor()
        c.executemany("INSERT INTO Course VALUES (NULL,?,?,?,?,?,?,?,?)", courses)
        conn.commit()
        conn.close()


def checkIfEssay(suffix):
    firstSuffix = suffix.split('/')[0]
    if firstSuffix in ['E', 'F', 'G', 'Z']:
        return 1
    else:
        return 0


def loadAllCourses():
    subjectDict = getSubjectIds()
    courses = []
    with open('data.json') as f:
        data = json.load(f)
        for course in data['course_summaries']:
            # Course Code / Subject ID / Suffix / Name / Description / IsEssayCourse / Weight / Year Level
            newCourse = (course['course_code'], subjectDict[course['course_dept']], course['course_suffix'], course['course_name'], course['course_details']
                         ['description'], checkIfEssay(course['course_suffix']), course['course_details']['course_weight'], math.floor(int(course['course_code']) / 1000))
            courses.append(newCourse)
    conn = sqlite3.connect('courseplanneruwo-server/CourseHelper.db')
    c = conn.cursor()
    c.executemany("INSERT INTO Course VALUES (NULL,?,?,?,?,?,?,?,?)", courses)
    conn.commit()
    conn.close()


def createCourseDict():
    courseDict = {}
    conn = sqlite3.connect('CourseHelper.db')
    c = conn.cursor()
    c.execute("SELECT Name FROM Subject")
    subjects = c.fetchall()
    for subject in subjects:
        courseDict[subject[0]] = {}

    c.execute("SELECT CourseId,Number,Subject.Name FROM Course JOIN Subject ON Course.SubjectId = Subject.SubjectId")
    courses = c.fetchall()
    conn.close()
    for course in courses:
        courseDict[course[2]][course[1]] = course[0]
    return courseDict
# Populate Antireq table


def loadAntireqs():
    courseDict = createCourseDict()
    antireqs = []
    with open('data.json') as f:
        data = json.load(f)
        for course in data['course_summaries']:
            if course['course_details']['anti_reqs'] is not None:
                currCourseId = courseDict[course['course_dept']
                                          ][course['course_code']]
                for antireq in course['course_details']['anti_reqs']['course_list']:
                    antireqCourseId = courseDict[antireq['department']
                                                 ][antireq['course_code']]
                    newAntireq = (currCourseId, antireqCourseId)
                    antireqs.append(newAntireq)
    conn = sqlite3.connect('CourseHelper.db')
    c = conn.cursor()
    c.executemany("INSERT INTO Antireq VALUES (NULL,?,?)", antireqs)
    conn.commit()
    conn.close()


def testing():
    ids = [1, 2, 5]
    conn = sqlite3.connect('CourseHelper.db')
    c = conn.cursor()
    c.execute(
        "SELECT * FROM Subject WHERE SubjectId IN ({0})".format(', '.join('?' for _ in ids)), ids)
    subjects = c.fetchall()
    conn.close()
    print(subjects)


def getCourses():
    ids = [1001]
    qry = open('dbtool.sql', 'r').read()
    conn = sqlite3.connect('CourseHelper.db')
    c = conn.cursor()
    c.execute(qry.format(', '.join('?' for _ in ids),
                         ', '.join('?' for _ in ids)), ids+ids)
    subjects = c.fetchall()
    conn.close()
    print(subjects[0])

def getSubjectId(subject):
    conn = sqlite3.connect('CourseHelper.db')
    conn.row_factory = lambda cursor, row: row[0]
    c = conn.cursor()
    c.execute("SELECT SubjectId FROM Subject WHERE Name=?",(subject,))
    subjId = c.fetchone()
    conn.close()
    return subjId
    
def getCourseId(subjectId,courseCode):
    conn = sqlite3.connect('CourseHelper.db')
    conn.row_factory = lambda cursor, row: row[0]
    c = conn.cursor()
    c.execute("SELECT CourseId FROM Course WHERE SubjectId=? AND Number=?",(subjectId,courseCode))
    subjId = c.fetchone()
    conn.close()
    return subjId
def addPrereq(courseId,quantity):
    conn = sqlite3.connect('CourseHelper.db')
    c = conn.cursor()
    c.execute("INSERT INTO Prereq VALUES (NULL,?,?)",(courseId,quantity))
    addedId = c.lastrowid
    conn.commit()
    conn.close()
    return addedId
def addPrereqDetails(prereqList):
    conn = sqlite3.connect('CourseHelper.db')
    c = conn.cursor()
    c.executemany("INSERT INTO PrereqDetail VALUES (?,?,?,?,?,?,?,?)",prereqList)
    conn.commit()
    conn.close()
    
class Course:
    def __init__(self, courseId, number, subject, suffix, name,description=""):
        self.courseId = courseId
        self.number = number
        self.subject = subject
        self.suffix = suffix
        self.name = name
        self.description=description

def loadPrereqs():
    with open("CompSci.json", "r") as data_json:
       data = json.load(data_json)
       prereqDetailId = 0
       prereqList = []
       for course in data['courseList']:
           courseId = getCourseId(getSubjectId(course['department']),course['code'])
           if len(course['prereq_list']) == 0:
               addPrereq(courseId,0)
           else:
               for prereq in course['prereq_list']:
                   prereqId = addPrereq(courseId,len(prereq['conditions']))
                   for condition in prereq['conditions']:
                       prereqDetailId += 1
                       val = condition['value']
                       if 'subjects' in condition:
                           for subject in condition['subjects']:
                               for i in range(subject['year'],5):
                                   newPrereqDetail = (prereqDetailId,None,getSubjectId(subject['subject']),None,None,val,i,prereqId)
                                   prereqList.append(newPrereqDetail)
                       if 'courses' in condition:
                           for course in condition['courses']:
                               newPrereqDetail = (prereqDetailId,getCourseId(getSubjectId(course['department']),course['code']),None,None,None,val,None,prereqId)
                               prereqList.append(newPrereqDetail)
                   
       addPrereqDetails(prereqList)

def antireqJson():
     with open("CompSci.json", "r") as data_json:
       data = json.load(data_json)
       antireqList = []
       for course in data['courseList']:
           courseId = getCourseId(getSubjectId(course['department']),course['code'])
           if 'antireq_list' in course:
               for antireq in course['antireq_list']:
                   newAntireq = (courseId, getCourseId(getSubjectId(antireq['department']),antireq['code']))
                   antireqList.append(newAntireq)
       conn = sqlite3.connect('CourseHelper.db')
       c = conn.cursor()
       c.executemany("INSERT INTO Antireq VALUES (NULL,?,?)",antireqList)
       conn.commit()
       conn.close()
antireqJson()
               