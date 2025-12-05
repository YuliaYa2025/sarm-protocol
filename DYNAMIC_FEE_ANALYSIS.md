# Dynamic Fee Adjustment Analysis

## ✅ Status: **COMPLETE**

The dynamic fee adjustment logic based on SSA scores is **fully implemented** and working.

## 📍 Location

**File:** `sarm-protocol/src/hooks/SARMHook.sol`

**Key Functions:**
- `_beforeSwap()` - Main hook function that adjusts fees
- `_feeForRating()` - Maps SSA rating to fee value
- `_determineRiskMode()` - Determines risk mode based on rating

## 🔄 How It Works

### Flow Diagram

```
Swap Request
    ↓
_beforeSwap() called
    ↓
Read SSA ratings for token0 and token1
    ↓
Calculate effective rating (max of both)
    ↓
_feeForRating(effectiveRating) → Get fee
    ↓
Return fee with OVERRIDE_FEE_FLAG
    ↓
Uniswap v4 applies the fee to the swap
```

### Implementation Details

**1. Rating Retrieval** (Lines 184-185):
```solidity
(uint8 rating0, ) = _getRating(token0);
(uint8 rating1, ) = _getRating(token1);
```

**2. Effective Rating Calculation** (Line 188):
```solidity
uint8 effectiveRating = rating0 > rating1 ? rating0 : rating1;
```
Uses worst-case (highest risk) rating of the pair.

**3. Fee Calculation** (Lines 211, 258-268):
```solidity
uint24 baseFee = _feeForRating(effectiveRating);
```

**4. Fee Override** (Line 217):
```solidity
uint24 feeOverride = baseFee | LPFeeLibrary.OVERRIDE_FEE_FLAG;
```

## 💰 Fee Structure

| SSA Rating | Risk Level | Fee | Fee Value (hundredths of bip) |
|------------|------------|-----|-------------------------------|
| 1-2 | Excellent | 0.005% | 50 |
| 3 | Good | 0.01% | 100 |
| 4 | Medium | 0.02% | 200 |
| 5 | High | 0.04% | 400 (but triggers FROZEN) |

**Note:** Rating 5 triggers `FROZEN` mode, which blocks swaps entirely.

## ⚠️ Known Limitation

### Decimal Precision Issue

**Location:** `SSAOracleAdapter._normalizeRating()` (Lines 216-244)

**Issue:** The current implementation truncates decimal SSA scores to integers:
- SSA score 2.3 → Rating 2 (Excellent) ❌ Should be Rating 3 (Good)
- SSA score 3.7 → Rating 3 (Good) ❌ Should be Rating 4 (Medium)

**SSA Score Bands:**
- 1.0-2.0 → Rating 1-2 (Excellent)
- 2.1-3.0 → Rating 3 (Good)
- 3.1-4.0 → Rating 4 (Medium)
- 4.1-5.0 → Rating 5 (High)

**Current Behavior:**
- 2.1-2.9 → Truncated to 2 → Treated as Excellent (0.005% fee)
- Should be treated as Good (0.01% fee)

**Comment in Code:**
> "Acceptable for MVP/hackathon; future enhancement: use absPrice / 1e17 for 1-decimal precision"

**Impact:**
- Low-risk stablecoins (2.1-2.9) get lower fees than they should
- Medium-risk stablecoins (3.1-3.9) get lower fees than they should

## ✅ What's Working

1. ✅ **Fee adjustment based on integer ratings** (1, 2, 3, 4, 5)
2. ✅ **Dynamic fee override** via `OVERRIDE_FEE_FLAG`
3. ✅ **Risk mode determination** (NORMAL, ELEVATED_RISK, FROZEN)
4. ✅ **Circuit breaker** (blocks swaps for rating 5)
5. ✅ **Event emissions** for monitoring (`FeeOverrideApplied`)
6. ✅ **Pool initialization check** (requires `DYNAMIC_FEE_FLAG`)

## 🔧 Potential Enhancements

### 1. Fix Decimal Precision (Recommended)

Update `SSAOracleAdapter._normalizeRating()` to handle 1-decimal precision:

```solidity
function _normalizeRating(int192 benchmarkPrice) internal pure returns (uint8) {
    if (benchmarkPrice < 0) revert InvalidRating();
    uint256 absPrice = uint256(int256(benchmarkPrice));
    
    // Use 1e17 for 1-decimal precision (e.g., 2.3e18 / 1e17 = 23)
    uint256 ratingScaled = absPrice / 1e17;
    
    // Map to rating bands:
    // 10-20 → Rating 1-2 (Excellent)
    // 21-30 → Rating 3 (Good)
    // 31-40 → Rating 4 (Medium)
    // 41-50 → Rating 5 (High)
    
    if (ratingScaled <= 20) {
        return ratingScaled <= 10 ? 1 : 2;
    } else if (ratingScaled <= 30) {
        return 3;
    } else if (ratingScaled <= 40) {
        return 4;
    } else {
        return 5;
    }
}
```

### 2. Add Fee Configuration

Make fee values configurable (currently hardcoded):

```solidity
struct FeeConfig {
    uint24 feeRating1;  // 50 (0.005%)
    uint24 feeRating2;  // 50 (0.005%)
    uint24 feeRating3;  // 100 (0.01%)
    uint24 feeRating4;  // 200 (0.02%)
    uint24 feeRating5;  // 400 (0.04%)
}

FeeConfig public feeConfig;
```

### 3. Add Fee Smoothing

Implement gradual fee increases instead of discrete bands:

```solidity
function _feeForRating(uint8 effectiveRating) internal view returns (uint24) {
    // Linear interpolation between bands
    // Rating 1 → 50, Rating 5 → 400
    return uint24(50 + (effectiveRating - 1) * 87.5); // ~87.5 per rating point
}
```

## 📊 Testing

**Test File:** `sarm-protocol/test/SARMHook.t.sol`

The test file includes comprehensive tests for:
- Fee calculation for different ratings
- Risk mode transitions
- Circuit breaker functionality
- Event emissions

## ✅ Conclusion

**The dynamic fee adjustment logic is COMPLETE and working correctly for integer SSA ratings.**

**Recommendation:** Fix the decimal precision issue in `SSAOracleAdapter._normalizeRating()` to properly handle SSA scores with decimals (2.1-2.9, 3.1-3.9, etc.).

