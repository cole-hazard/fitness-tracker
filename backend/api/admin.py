from django.contrib import admin
from .models import (
    MuscleGroup, Exercise, Workout, WorkoutExercise, Plan,
    ExerciseMuscleActivation # Import the new model
)

# Inline admin for the Exercise<->MuscleGroup relationship
class ExerciseMuscleActivationInline(admin.TabularInline):
    model = ExerciseMuscleActivation
    extra = 1 # Show one empty form by default

class ExerciseAdmin(admin.ModelAdmin):
    inlines = (ExerciseMuscleActivationInline,)
    list_display = ('name', 'description') # Customize as needed
    search_fields = ('name',)

class WorkoutExerciseInline(admin.TabularInline): # Optional: Inline for Workout<->Exercise
    model = WorkoutExercise
    extra = 1

class WorkoutAdmin(admin.ModelAdmin):
    inlines = (WorkoutExerciseInline,)
    list_display = ('name', 'description')
    search_fields = ('name',)


admin.site.register(MuscleGroup)
admin.site.register(Exercise, ExerciseAdmin) # Use the custom admin
admin.site.register(Workout, WorkoutAdmin) # Use the custom admin
admin.site.register(Plan)
# Optional: Register intermediate models directly if needed for debugging
# admin.site.register(WorkoutExercise)
# admin.site.register(ExerciseMuscleActivation)