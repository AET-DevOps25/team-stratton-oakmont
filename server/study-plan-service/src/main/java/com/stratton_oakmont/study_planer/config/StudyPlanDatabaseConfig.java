package com.stratton_oakmont.study_planer.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.boot.jdbc.DataSourceBuilder;

import javax.sql.DataSource;
import jakarta.persistence.EntityManagerFactory;
import java.util.Properties;

@Configuration
@EnableJpaRepositories(
    basePackages = "com.stratton_oakmont.study_planer.repository.studyplan",
    entityManagerFactoryRef = "studyPlanEntityManagerFactory",
    transactionManagerRef = "studyPlanTransactionManager"
)
public class StudyPlanDatabaseConfig {
    
    @Value("${DB_STUDY_PLAN_URL}")
    private String url;
    
    @Value("${DB_STUDY_PLAN_USERNAME}")
    private String username;
    
    @Value("${DB_STUDY_PLAN_PASSWORD}")
    private String password;
    
    @Primary
    @Bean(name = "studyPlanDataSource")
    public DataSource studyPlanDataSource() {
        return DataSourceBuilder.create()
                .url(url)
                .username(username)
                .password(password)
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    @Primary
    @Bean(name = "studyPlanEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean studyPlanEntityManagerFactory() {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(studyPlanDataSource());
        em.setPackagesToScan("com.stratton_oakmont.study_planer.entity.studyplan");
        
        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);
        
        Properties properties = new Properties();
        properties.setProperty("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        properties.setProperty("hibernate.hbm2ddl.auto", "update");
        properties.setProperty("hibernate.show_sql", "true");
        em.setJpaProperties(properties);
        
        return em;
    }

    @Primary
    @Bean(name = "studyPlanTransactionManager")
    public PlatformTransactionManager studyPlanTransactionManager() {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(studyPlanEntityManagerFactory().getObject());
        return transactionManager;
    }
}