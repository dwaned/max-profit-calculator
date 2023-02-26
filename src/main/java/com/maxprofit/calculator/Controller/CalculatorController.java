package com.maxprofit.calculator.Controller;

import com.maxprofit.calculator.CalculationResult;
import com.maxprofit.calculator.Stock;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CalculatorController {

  @PostMapping("/calculate")
  public CalculationResult calculate(@RequestBody CalculationRequest request) {
    return Stock.returnIndicesMaxProfit(request.getSavingsAmount(),
            request.getCurrentPrices(), request.getFuturePrices());
  }
}
