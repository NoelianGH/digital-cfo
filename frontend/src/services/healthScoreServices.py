import numpy as np
import pandas as pd

def derajat_fuzzy(x, a, b, c):
    if x <= a:
        return 0
    elif a < x <= b:
        return (x - a) / (b - a)
    elif b < x <= c:
        return (c - x) / (c - b)
    else:
        return 0

def based_rule(a, b):
    if (a & b == 1):
        return min(a, b)
    elif (a | b == 1):
        return max(a, b)

def alpha_cut(df, alpha):
    return df[df['derajat_fuzzy'] >= alpha]
