from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
from .models import (
     MuscleGroup, Exercise, Workout, Plan, # No need to import intermediate models directly here
     # ExerciseMuscleActivation, WorkoutExercise
)
from .serializers import (
    MuscleGroupSerializer, ExerciseSerializer, WorkoutSerializer, PlanSerializer, UserSerializer
    # No need to import intermediate serializers directly here
    # ExerciseMuscleActivationSerializer, WorkoutExerciseSerializer
)

# Create your views here.
class MuscleGroupViewSet(viewsets.ModelViewSet):
    queryset = MuscleGroup.objects.all()
    serializer_class = MuscleGroupSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ExerciseViewSet(viewsets.ModelViewSet):
    # Updated queryset to prefetch related activation data
    queryset = Exercise.objects.all().prefetch_related(
        'muscle_activations__muscle_group' # Prefetch through intermediate model
        # the double underline traverses the relationships
    )
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class WorkoutViewSet(viewsets.ModelViewSet):
    # Updated queryset to prefetch through WorkoutExercise -> Exercise -> ExerciseMuscleActivation -> MuscleGroup
    queryset = Workout.objects.all().prefetch_related(
        'workout_exercises__exercise__muscle_activations__muscle_group'
    )
    serializer_class = WorkoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Optional owner filtering/assignment
    # def get_queryset(self): ...
    # def perform_create(self, serializer): ...

class PlanViewSet(viewsets.ModelViewSet):
    serializer_class = PlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users should only see their own plans
        # Prefetching needs to go deep if you want all details efficiently
        return Plan.objects.filter(owner=self.request.user).prefetch_related(
            'day1_workout__workout_exercises__exercise__muscle_activations__muscle_group',
            'day2_workout__workout_exercises__exercise__muscle_activations__muscle_group',
            'day3_workout__workout_exercises__exercise__muscle_activations__muscle_group',
            'day4_workout__workout_exercises__exercise__muscle_activations__muscle_group',
            'day5_workout__workout_exercises__exercise__muscle_activations__muscle_group',
            'day6_workout__workout_exercises__exercise__muscle_activations__muscle_group',
            'day7_workout__workout_exercises__exercise__muscle_activations__muscle_group',
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    # Optional: @action for set_active etc.
    # ...
