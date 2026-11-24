from app.agent import heuristic

def test_demo_evaluation_scores_are_bounded():
    result=heuristic("Explain Python lists","A list is mutable and ordered. For example, it can change.")
    for key in ("correctness","clarity","relevance","examples"):
        assert 0 <= result[key] <= 5
