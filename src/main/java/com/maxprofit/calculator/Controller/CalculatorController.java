package com.maxprofit.calculator.Controller;

import com.maxprofit.calculator.Data;
import com.maxprofit.calculator.Stock;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CalculatorController {

  @PostMapping("/calculate")
  public String calculate(@RequestBody CalculationRequest request) {
    Data result = Stock.returnIndicesMaxProfit(request.getSavingsAmount(), request.getCurrentPrices(), request.getFuturePrices());
    return "Max Profit: " + result.maxProfit + " with indices " + result.indices;
  }
}
