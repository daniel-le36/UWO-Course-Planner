SELECT
    Courses.CourseId AS CourseId,
    SubjectName,
    Number,
    Suffix,
    Name
FROM
    (
        SELECT
            CourseId,
            Subject.Name as SubjectName,
            Number,
            Suffix,
            Course.Name as Name
        FROM
            Course
            JOIN Subject ON Course.SubjectId = Subject.SubjectId
    ) as Courses
    JOIN (
        SELECT
            CourseId
        FROM
            Prereq
            JOIN (
                SELECT
                    PrereqId
                FROM
                    PrereqDetail
                    INNER JOIN (
                        SELECT
                            *
                        FROM
                            Course
                        WHERE
                            CourseId = ?
                    ) as ChosenCourses ON ChosenCourses.CourseId = coalesce(PrereqDetail.CourseId, ChosenCourses.CourseId)
                    AND ChosenCourses.SubjectId = coalesce(PrereqDetail.SubjectId, ChosenCourses.SubjectId)
                    AND ChosenCourses.Year = coalesce(PrereqDetail.Year, ChosenCourses.Year)
                    AND ChosenCourses.IsEssay = coalesce(PrereqDetail.IsEssay, ChosenCourses.IsEssay)
                GROUP BY
                    PrereqId
            ) as prereqdetails ON Prereq.PrereqId = prereqdetails.PrereqId
    ) as prereqCourses ON prereqCourses.CourseId = Courses.CourseId