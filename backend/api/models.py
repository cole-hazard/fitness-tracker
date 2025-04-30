from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class MuscleGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Exercise(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True, null=True)
    muscle_groups = models.ManyToManyField(MuscleGroup, related_name='exercises')

    def __str__(self):
        return self.name

class ExerciseMuscleActivation(models.Model):
    class ActivationLevel(models.TextChoices):
        HIGH = 'H', 'High'
        MEDIUM = 'M', 'Medium'
        LOW = 'L', 'Low'

    exercise = models.ForeignKey('Exercise', on_delete=models.CASCADE, related_name='muscle_activations')
    muscle_group = models.ForeignKey('MuscleGroup', on_delete=models.CASCADE, related_name='exercise_activations')
    activation_level = models.CharField(
        max_length=1,
        choices=ActivationLevel.choices,
        default=ActivationLevel.MEDIUM,
    )

    class Meta:
        unique_together = ('exercise', 'muscle_group') # Prevent duplicates

    def __str__(self):
        return f"{self.exercise.name} - {self.muscle_group.name}: {self.get_activation_level_display()}"

class Workout(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    # The connection to Exercises with sets/reps needs an intermediate table
    exercises = models.ManyToManyField(
        Exercise,
        through='WorkoutExercise',
        related_name='workouts'
    )
    # Optional: Link workout to a user if workouts are user-specific creations
    # owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_workouts', null=True, blank=True)


    def __str__(self):
        return self.name

class WorkoutExercise(models.Model):
    workout = models.ForeignKey('Workout', on_delete=models.CASCADE)
    exercise = models.ForeignKey('Exercise', on_delete=models.CASCADE)
    target_sets = models.PositiveIntegerField()
    target_reps = models.CharField(max_length=50) # e.g., "8-12", "15", "AMRAP"

    class Meta:
        unique_together = ('workout', 'exercise') # Prevent adding the same exercise twice to one workout

    def __str__(self):
        return f"{self.workout.name} - {self.exercise.name}"

class Plan(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='plans')
    is_active = models.BooleanField(default=False) # To mark the user's currently selected plan

    # Option A: Simple Fixed Structure (e.g., 7 days)
    day1_workout = models.ForeignKey(Workout, on_delete=models.SET_NULL, related_name='+', blank=True, null=True)
    day1_is_rest = models.BooleanField(default=False)
    day2_workout = models.ForeignKey(Workout, on_delete=models.SET_NULL, related_name='+', blank=True, null=True)
    day2_is_rest = models.BooleanField(default=False)
    day3_workout = models.ForeignKey(Workout, on_delete=models.SET_NULL, related_name='+', blank=True, null=True)
    day3_is_rest = models.BooleanField(default=False)
    day4_workout = models.ForeignKey(Workout, on_delete=models.SET_NULL, related_name='+', blank=True, null=True)
    day4_is_rest = models.BooleanField(default=False)
    day5_workout = models.ForeignKey(Workout, on_delete=models.SET_NULL, related_name='+', blank=True, null=True)
    day5_is_rest = models.BooleanField(default=False)
    day6_workout = models.ForeignKey(Workout, on_delete=models.SET_NULL, related_name='+', blank=True, null=True)
    day6_is_rest = models.BooleanField(default=False)
    day7_workout = models.ForeignKey(Workout, on_delete=models.SET_NULL, related_name='+', blank=True, null=True)
    day7_is_rest = models.BooleanField(default=False)

    # Option B: Flexible Structure using JSONField (Requires PostgreSQL)
    # schedule = models.JSONField(default=dict, blank=True)
    # Example: {'monday': {'workout_id': 1, 'is_rest': False}, 'tuesday': {'is_rest': True}, ...}

    # Option C: Separate PlanDay model (More relational, flexible)
    # See note below

    def __str__(self):
        return f"{self.name} ({self.owner.username})"

    # Add logic to ensure only one plan is active per user if needed (e.g., in save method)

# ADD user here