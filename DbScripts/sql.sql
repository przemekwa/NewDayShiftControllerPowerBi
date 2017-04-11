USE NewOffice

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER VIEW [dbo].[dayShiftPowerBi]
AS
SELECT TOP (100) PERCENT ta.timetableDate AS Date,
       ag.[name] AS ActivityGroupName,
          ag.[shortcut] AS ActivityGroupShortcut,
          e.[forenameSurname] AS EmployeFullName,
          e.[id_employee]
  FROM [dbo].[TimetableActivity] ta JOIN
       [dbo].[ActivityGroup] ag ON
            ag.[id_activityGroup] = ta.[activityGroup_id] AND
             ag.[logSys] = ta.[logSys] AND
             ag.[is_deleted] = ta.[is_deleted] JOIN
          [dbo].[Employees] e ON
            e.[id_employee] = ta.[employee_id] AND
             e.[logSys] = ta.[logSys] AND
             e.[is_deleted] = ta.[is_deleted]
  WHERE ag.[name] LIKE N'Serwis SAP tech.%' AND
             ta.[logSys] = 30801 AND
             ta.[is_deleted] = 0
  ORDER BY Date, ActivityGroupShortcut
