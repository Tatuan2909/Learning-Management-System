namespace Lms.Domain.Enums;

public enum UserRole
{
    ADMIN,
    TEACHER,
    STUDENT
}

public enum LessonContentType
{
    VIDEO,
    PDF,
    TEXT
}

public enum QuestionType
{
    SINGLE_CHOICE,
    MULTIPLE_CHOICE
}

public enum SubmissionStatus
{
    SUBMITTED,
    LATE,
    GRADED
}

public enum GradeLetter
{
    A,
    B,
    C,
    D,
    F
}
