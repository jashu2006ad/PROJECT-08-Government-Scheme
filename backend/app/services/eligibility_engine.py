"""
GovScheme Dynamic Rule Evaluation Engine
Evaluates nested AST rule definitions against user profile attributes.
Supports operators: ==, !=, >, <, >=, <=, IN, NOT_IN, EXISTS
Supports compound logical operators: AND, OR
Tracks matched conditions, unmatched conditions, and missing inputs.
"""

from typing import Dict, Any, List, Tuple

def compare_values(user_val: Any, operator: str, target_val: Any) -> bool:
    try:
        # String case-insensitivity helper
        if isinstance(user_val, str) and isinstance(target_val, str):
            u_clean = user_val.strip().lower()
            t_clean = target_val.strip().lower()
        else:
            u_clean = user_val
            t_clean = target_val

        # Numeric conversions if appropriate
        if isinstance(target_val, (int, float)) and not isinstance(user_val, (int, float)):
            try:
                user_val = float(str(user_val).replace(",", "").strip())
                u_clean = user_val
            except (ValueError, TypeError):
                pass

        if operator == "==":
            return u_clean == t_clean
        elif operator == "!=":
            return u_clean != t_clean
        elif operator == ">":
            return float(user_val) > float(target_val)
        elif operator == "<":
            return float(user_val) < float(target_val)
        elif operator == ">=":
            return float(user_val) >= float(target_val)
        elif operator == "<=":
            return float(user_val) <= float(target_val)
        elif operator == "IN":
            if isinstance(target_val, list):
                target_list = [str(x).strip().lower() for x in target_val]
                return str(user_val).strip().lower() in target_list
            return str(user_val).strip().lower() in str(target_val).strip().lower()
        elif operator == "NOT_IN":
            if isinstance(target_val, list):
                target_list = [str(x).strip().lower() for x in target_val]
                return str(user_val).strip().lower() not in target_list
            return str(user_val).strip().lower() not in str(target_val).strip().lower()
        elif operator == "EXISTS":
            return bool(user_val is not None and user_val != "")
        else:
            return False
    except (TypeError, ValueError):
        return False

class EligibilityEngine:
    @staticmethod
    def evaluate_condition(condition: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a single condition leaf or nested rule block.
        Returns a condition report dict.
        """
        # If this is a nested block (has 'operator' and 'conditions')
        if "conditions" in condition:
            return EligibilityEngine.evaluate_node(condition, user_profile)

        field = condition.get("field", "")
        op = condition.get("operator", "==")
        target_val = condition.get("value")
        desc = condition.get("description", f"{field} {op} {target_val}")

        # Check if field exists in user profile
        if field not in user_profile or user_profile[field] is None or user_profile[field] == "":
            return {
                "field": field,
                "operator": op,
                "targetValue": target_val,
                "actualValue": None,
                "description": desc,
                "status": "MISSING",
                "message": f"Required information '{field}' was not provided."
            }

        user_val = user_profile[field]
        passed = compare_values(user_val, op, target_val)

        return {
            "field": field,
            "operator": op,
            "targetValue": target_val,
            "actualValue": user_val,
            "description": desc,
            "status": "PASS" if passed else "FAIL",
            "message": f"Condition met ({user_val})" if passed else f"Condition not met (Your {field}: {user_val}, required {op} {target_val})"
        }

    @staticmethod
    def evaluate_node(node: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a rule tree node (AND / OR).
        """
        operator = node.get("operator", "AND").upper()
        conditions = node.get("conditions", [])

        if not conditions:
            # If no conditions defined, default to eligible
            return {
                "status": "PASS",
                "matchedConditions": [],
                "unmatchedConditions": [],
                "missingInformation": []
            }

        matched = []
        unmatched = []
        missing = []

        for cond in conditions:
            res = EligibilityEngine.evaluate_condition(cond, user_profile)
            if "conditions" in cond or "matchedConditions" in res:
                # Sub-node flattened results
                matched.extend(res.get("matchedConditions", []))
                unmatched.extend(res.get("unmatchedConditions", []))
                missing.extend(res.get("missingInformation", []))
                sub_status = res.get("status", "FAIL")
                if sub_status == "PASS":
                    matched.append(cond.get("description", "Nested group criteria passed"))
                elif sub_status == "MISSING":
                    missing.append(cond.get("description", "Nested group missing info"))
                else:
                    unmatched.append(cond.get("description", "Nested group criteria failed"))
            else:
                if res["status"] == "PASS":
                    matched.append(res)
                elif res["status"] == "MISSING":
                    missing.append(res)
                else:
                    unmatched.append(res)

        if operator == "AND":
            if unmatched:
                status = "FAIL"
            elif missing:
                status = "MISSING"
            else:
                status = "PASS"
        elif operator == "OR":
            if matched:
                status = "PASS"
            elif missing and not unmatched:
                status = "MISSING"
            elif missing and unmatched:
                # Some failed, some missing, might pass if missing answered
                status = "MISSING"
            else:
                status = "FAIL"
        else:
            status = "FAIL"

        return {
            "status": status,
            "matchedConditions": matched,
            "unmatchedConditions": unmatched,
            "missingInformation": missing
        }

    @classmethod
    def evaluate_scheme(cls, scheme: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a scheme's eligibility rule against the user profile.
        Returns:
            result: 'eligible' | 'ineligible' | 'needs_more_information'
            matchedConditions: list
            unmatchedConditions: list
            missingInformation: list
            explanation: str
        """
        rule = scheme.get("eligibility", {}).get("rule")
        if not rule or not isinstance(rule, dict) or not rule.get("conditions"):
            # If scheme doesn't have an automated rule, check basic state/target filters
            return {
                "schemeId": str(scheme.get("_id", "")),
                "schemeName": scheme.get("schemeName", ""),
                "result": "eligible",
                "matchedConditions": [{"description": "General public scheme with no restrictive automated criteria."}],
                "unmatchedConditions": [],
                "missingInformation": [],
                "explanation": "You meet the general requirements for this scheme."
            }

        eval_res = cls.evaluate_node(rule, user_profile)
        status = eval_res["status"]

        if status == "PASS":
            result = "eligible"
            explanation = "You meet all verified eligibility requirements for this scheme."
        elif status == "MISSING":
            result = "needs_more_information"
            explanation = "Some required details are missing from your profile to determine full eligibility."
        else:
            result = "ineligible"
            failed_reasons = [c.get("description", str(c)) for c in eval_res["unmatchedConditions"] if isinstance(c, dict)]
            explanation = f"You do not meet one or more conditions: {', '.join(failed_reasons[:3])}" if failed_reasons else "One or more eligibility criteria were not satisfied."

        return {
            "schemeId": str(scheme.get("_id", "")),
            "schemeName": scheme.get("schemeName", ""),
            "result": result,
            "matchedConditions": eval_res["matchedConditions"],
            "unmatchedConditions": eval_res["unmatchedConditions"],
            "missingInformation": eval_res["missingInformation"],
            "explanation": explanation
        }
