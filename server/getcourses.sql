SELECT
    AvaiCourses.CourseId AS CourseId, SubjectName,Number,Suffix,Description,Weight,Name,SubjectId
FROM
    (
        SELECT
            DISTINCT(CourseId)
        FROM
            Prereq
            JOIN (
                SELECT
                    PrereqId,
                    COUNT(*) as Quantity
                FROM
                    (
                        SELECT
                            PrereqDetailId,
                            SUM(ChosenCourses.Weight) >= PrereqDetail.Value as Valid,
                            PrereqId
                        FROM
                            PrereqDetail
                            INNER JOIN (
                                SELECT
                                    *
                                FROM
                                    Course
                                WHERE
                                    CourseId IN ({0})
                            ) as ChosenCourses ON ChosenCourses.CourseId = coalesce(PrereqDetail.CourseId, ChosenCourses.CourseId)
                            AND ChosenCourses.SubjectId = coalesce(PrereqDetail.SubjectId, ChosenCourses.SubjectId)
                            AND ChosenCourses.Year = coalesce(PrereqDetail.Year, ChosenCourses.Year)
                            AND ChosenCourses.IsEssay = coalesce(PrereqDetail.IsEssay, ChosenCourses.IsEssay)
                        GROUP BY
                            PrereqDetailId
                    ) as MatchedCourses
                WHERE
                    Valid = 1
                GROUP BY
                    PrereqId
            ) as ValidCourses ON Prereq.PrereqId = ValidCourses.PrereqId
        WHERE
            ValidCourses.Quantity >= Prereq.Quantity
    ) AS AvaiCourses
    JOIN (SELECT CourseId, Subject.Name as SubjectName,Number,Suffix,Description,Weight,Course.Name, Subject.SubjectId FROM Course JOIN Subject ON Course.SubjectId = Subject.SubjectId) as Courses ON Courses.CourseId = AvaiCourses.CourseId
WHERE
    Courses.CourseId NOT IN (
        SELECT
            DISTINCT(CourseId)
        FROM
            Antireq
        WHERE
            AntireqCourseId IN ({1})
    ) AND Courses.CourseId NOT IN ({2})